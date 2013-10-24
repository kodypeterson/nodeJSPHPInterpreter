
/*
 * GET home page.
 */

exports.fs = require("fs");
exports.path = "./tests";
exports.currentJSInterpretation = "";
exports.response = "";

exports.debug = false;
exports.errorOnPage = false;

exports.inClass = false;
exports.inFunction = false;

exports.index = function(req, res){
    exports.response = ""; //NEED TO MAKE THIS PER CONNECTION!!
    var file = req.path.substring(1);
    if(file === ""){
        file = "index.php";
    }
    exports.endResult = exports.getFile(file);
    if(exports.debug){
        res.send(exports.endResult.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br>"));
    }
    exports.runConvertedPHP(req, res);
    if(!exports.debug && !exports.errorOnPage){
        res.send(exports.response+"<br><br>-------------------<br>"+exports.endResult.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br>"));
    }
};

exports.getFileCode = function(fileName){
    return exports.fs.readFileSync(exports.path+"/"+fileName, "utf8");
};

exports.getFile = function(fileName){
    var convertedCode = "";
    exports.getFileCode(fileName).toString().split('\n').forEach(function (line){
        if(line != "<?php" && line != "<?" && line != "?>"){
            if(convertedCode !== ""){
                convertedCode += "\n";
            }
            convertedCode += exports.convertPHPtoJS(line);
        }
    });
    return convertedCode;
};

exports.convertPHPtoJS = function(PHP){
    // I KNOW THIS SOUNDS CRAZY!!! BUT HOPEFULLY WE CAN ACTUALLY DO THIS
    // ON TO HOURS AND DAYS OF PULLING MY HAIR OUT I AM SURE!!! - SHOULD BE FUN

    //TAKE CARE OF . AFTER " OR BEFORE $ AND THE . IS NOT IN QUOTES
    PHP = PHP.replace(/(["])[.](?=")|[.](?=\$)/g, "$1+").replace(/(.*)("?)\.(?=([^"]*"[^"]*")*[^"]*$)["]/g, "$1$2+\"");

    //HANDLE VARIABLES
    PHP = PHP.replace(/\$(.*) = /g, "var $1 = ");
    PHP = PHP.replace(/\$(?=([^"]*"[^"]*")*[^"]*$)/g, ""); //ONLY REPLACE THE $ IF IT IS NOT IN QUOTES

    //HANDLE ECHO'S
    if(PHP.match(/echo ("|')(.*)("|');?/g) || PHP.match(/echo (.*);?/g)){
        PHP = PHP.replace(/echo ("|')(.*)("|');?/g, "exports.response += $1$2$3");
        if(PHP.match(/echo (.*);?/g)){
            PHP = PHP.replace(/echo (.*);?/g, "exports.response += $1");
        }else{
            if(PHP.slice(-1) != ";"){
                PHP = PHP+";";
            }
        }
    }

    //HANDLE MULTI-DIMENSIONAL ARRAYS
    PHP = PHP.replace(/=>/g, ",'=>',");

    //HANDLE INCLUDES
    PHP = PHP.replace(/include\((.*)\);/g, function(match, capture){return include(capture.replace(/"/g, ""));});

    //HANDLE CLASSES
    if(PHP.match(/class (.*)\{/)){
        //FIRST LINE OF CLASS
        temp = PHP.split(" ");
        temp[1] = temp[1].replace("{", "");
        PHP = temp[1]+" = createClass('"+temp[1]+"',{";
        exports.inClass = true;
    }

    //HANDLE PUBLIC/PRIVATE/PROTECTED VARIABLES
    var temp = PHP.match(/(public|private|protected) var (.*) = (.*)/);
    if(temp){
        PHP = '"'+temp[1]+"+"+temp[2]+'":'+temp[3].replace(";", ",");
    }

    //HANDLE INSIDE FUNCTIONS
    if(exports.inFunction){
        if(PHP.trim() == "}"){
            exports.inFunction = false;
            PHP = "],";
        }else{
            PHP = '"'+PHP.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')+'",';
        }
    }

    //HANDLE PUBLIC/PRIVATE/PROTECTED FUNCTIONS
    temp = PHP.match(/(public|private|protected) function (.*)/);
    if(temp){
        PHP = '"'+temp[1]+"+function+"+temp[2].replace("{", "")+'":[';
        exports.inFunction = true;
    }

    if(exports.inClass && !exports.inFunction){
        if(PHP.trim() == "}"){
            exports.inClass = false;
            PHP = "});";
        }
    }

    //HANDLE NEW
    PHP = PHP.replace(/= new (.*);/g, function(match, capture){
        return "= "+capture+";";
    });

    //HANDLE -> (function)
    PHP = PHP.replace(/->(.*)\(/g, ".$1(");

    //HANDLE ->
    PHP = PHP.replace(/->(.*);/g, ".$1;");

    console.log(PHP);
    return PHP;
};

exports.runConvertedPHP = function(req, res){
    try{
        eval(exports.endResult); //I KNOW EVAL IS BAD BAD BAD, BUT IT IS GOOD HERE!
    }catch (e){
        if(e.message.match(/(.*) is not defined/)){
            //VARIABLE NOT DEFINED - WE CAN FIX THIS ;)
            exports.response = "";
            variableName = e.message.match(/(.*) is not defined/);
            exports.endResult = "var "+variableName[1]+" = undefined;\n"+exports.endResult;
            //console.log(exports.endResult);
            exports.runConvertedPHP(req, res);
        }else{
            if(exports){
                exports.errorOnPage = true;
            }
            var vDebug = "";
            for (var prop in e){
               vDebug += "property: "+ prop+ " value: ["+ e[prop]+ "]\n";
            }
            vDebug += "toString(): " + " value: [" + e.toString() + "]";
            console.log(vDebug);
            if(res === null){
                exports.response = "Error: "+vDebug;
            }else{
                res.send("Error: "+vDebug);
            }
        }
    }
};

//THESE ARE THE PHP FUNCTION AS JS FUNCTIONS
//WE DYNAMICALLY LOAD THEM FROM "php_functions"
exports.functions = [];
exports.fs.readdirSync("./php_functions").forEach(function(file) {
    exports.functions.push(file);
});
for (var i = 0; i < exports.functions.length; i++) {
    eval(exports.fs.readFileSync("./php_functions/" + exports.functions[i]).toString());
}
