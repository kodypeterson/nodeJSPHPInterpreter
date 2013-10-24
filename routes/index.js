
/*
 * GET home page.
 */

exports.fs = require("fs");
exports.path = "./tests";
exports.currentJSInterpretation = "";
exports.response = "";

exports.debug = false;
exports.errorOnPage = false;

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

    //TAKE CARE OF . AFTER " OR BEFORE $
    //PHP = PHP.replace(/(["])[.](?=")|[.](?=\$)/g, "$1+").replace(/[^"](([$])(.*))([.])/g, "$1$2+");

    //HANDLE VARIABLES
    PHP = PHP.replace(/\$(.*) = /g, "var $1 = ");
    PHP = PHP.replace(/\$/g, "");

    //HANDLE ECHO'S
    PHP = PHP.replace(/echo ("|')(.*)("|');?/g, "exports.response += $1$2$3;").replace(/echo (.*);?/g, "exports.response += $1");

    //HANDLE MULTI-DIMENSIONAL ARRAYS
    PHP = PHP.replace(/=>/g, ",'=>',");

    //HANDLE INCLUDES
    PHP = PHP.replace(/include\((.*)\);/g, function(match, capture){return include(capture.replace(/"/g, ""));});

    //HANDLE CLASSES
    PHP = PHP.replace(/class (.*){((.|\n)*)\}/g, function(match, className, insideClass){
        classVar = {};
        temp = insideClass.split("\n");
        inFunction = false;
        for (var i = 0; i < temp.length; i++) {
            if(temp[i].match(/(public|private|protected) (.*) = (.*);/)){
                t = temp[i].match(/(public|private|protected) (.*) = (.*);/);
                classVar[t[2]] = {};
                classVar[t[2]]["value"] = t[3].replace(/(^")|("$)/g, "");
                classVar[t[2]]["type"] = t[1];
            }else if(temp[i] !== ""){
                if(!inFunction && temp[i].match(/(public|private|protected) function/)){
                    t = temp[i].match(/(public|private|protected) function (.*)\((.*)\)/);
                    inFunction = t[2];
                    classVar[t[2]] = {};
                    classVar[t[2]]["isFunction"] = true;
                    classVar[t[2]]["type"] = t[1];
                    classVar[t[2]]["arguments"] = t[3];
                }else if(inFunction){
                    if(temp[i].trim() == "}"){
                        classVar[inFunction]["value"] = classVar[inFunction]["value"];
                        inFunction = false;
                    }else{
                        if(classVar[inFunction]["value"] === undefined){
                            classVar[inFunction]["value"] = temp[i].trim();
                        }else{
                            classVar[inFunction]["value"] += temp[i].trim();
                        }
                    }
                }
            }
        }
        return className+" = "+JSON.stringify(classVar, function (key, value) {
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        });
    });

    //HANDLE NEW
    PHP = PHP.replace(/= new (.*);/g, function(match, capture){
        customParse = "(function (obj){\
            for (var prop in obj) {\
                if(obj[prop]['isFunction']){\
                    obj[prop]['value'] = (function(){eval("+capture+"[prop]['value']);});\
                }\
            }\
            return obj;\
        })("+capture+")";
        return "= "+customParse;
    });

    //HANDLE -> (function)
    PHP = PHP.replace(/->(.*)\(/g, "['$1']['value'](");

    //HANDLE ->
    PHP = PHP.replace(/->(.*);/g, "['$1']['value']");

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
            if(res == null){
                exports.response = "Error: "+vDebug;
            }else{
                res.send("Error: "+vDebug);
            }
        }
    }
};

//THESE ARE THE PHP FUNCTION AS JS FUNCTIONS
function include(fileName){
    return exports.getFile(fileName);
}

function isset(){
    var a = arguments,
    l = a.length,
    i = 0;

    if (l === 0) {
        throw new Error('Empty isset');
    }
    while (i !== l) {
        if (a[i] === undefined || a[i] === null) {
            return false;
        }
        i++;
    }
    return true;
}

function array(){
    var a = arguments,
        l = a.length,
        i = 0,
        retObj = [],
        keyCount = 0;

    while (i !== l) {
        if(a[i + 1] == "=>"){
            if(retObj.length === 0){
                retObj = {};
            }
            retObj[a[i]] = a[i + 2];
            i += 3;
        }else if(retObj.push === undefined){
            //THIS IS PART OF AN OBJECT BUT NO KEY
            retObj[keyCount] = a[i];
            keyCount++;
            i++;
        }else{
            retObj.push(a[i]);
            i++;
        }
    }
    return retObj;
}

function var_dump(){
    var output = '',
        pad_char = ' ',
        pad_val = 4,
        lgth = 0,
        i = 0;

    var _getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn);
        if (!name) {
            return '(Anonymous)';
        }
        return name[1];
    };

    var _repeat_char = function (len, pad_char) {
        var str = '';
        for (var i = 0; i < len; i++) {
            str += pad_char;
        }
        return str;
    };
      
    var _getInnerVal = function (val, thick_pad) {
        var ret = '';
        if (val === null) {
            ret = 'NULL';
        } else if (typeof val === 'boolean') {
            ret = 'bool(' + val + ')';
        } else if (typeof val === 'string') {
            ret = 'string(' + val.length + ') "' + val + '"';
        } else if (typeof val === 'number') {
            if (parseFloat(val) == parseInt(val, 10)) {
                ret = 'int(' + val + ')';
            } else {
                ret = 'float(' + val + ')';
            }
        }
        // The remaining are not PHP behavior because these values only exist in this exact form in JavaScript
        else if (typeof val === 'undefined') {
            ret = 'undefined';
        } else if (typeof val === 'function') {
            var funcLines = val.toString().split('\n');
            ret = '';
            for (var i = 0, fll = funcLines.length; i < fll; i++) {
                ret += (i !== 0 ? '\n' + thick_pad : '') + funcLines[i];
            }
        } else if (val instanceof Date) {
            ret = 'Date(' + val + ')';
        } else if (val instanceof RegExp) {
            ret = 'RegExp(' + val + ')';
        } else if (val.nodeName) { // Different than PHP's DOMElement
            switch (val.nodeType) {
                case 1:
                    if (typeof val.namespaceURI === 'undefined' || val.namespaceURI === 'http://www.w3.org/1999/xhtml') { // Undefined namespace could be plain XML, but namespaceURI not widely supported
                        ret = 'HTMLElement("' + val.nodeName + '")';
                    } else {
                        ret = 'XML Element("' + val.nodeName + '")';
                    }
                    break;
                case 2:
                    ret = 'ATTRIBUTE_NODE(' + val.nodeName + ')';
                    break;
                case 3:
                    ret = 'TEXT_NODE(' + val.nodeValue + ')';
                    break;
                case 4:
                    ret = 'CDATA_SECTION_NODE(' + val.nodeValue + ')';
                    break;
                 case 5:
                    ret = 'ENTITY_REFERENCE_NODE';
                    break;
                case 6:
                    ret = 'ENTITY_NODE';
                    break;
                case 7:
                    ret = 'PROCESSING_INSTRUCTION_NODE(' + val.nodeName + ':' + val.nodeValue + ')';
                    break;
                case 8:
                    ret = 'COMMENT_NODE(' + val.nodeValue + ')';
                    break;
                case 9:
                    ret = 'DOCUMENT_NODE';
                    break;
                case 10:
                    ret = 'DOCUMENT_TYPE_NODE';
                    break;
                case 11:
                    ret = 'DOCUMENT_FRAGMENT_NODE';
                    break;
                case 12:
                    ret = 'NOTATION_NODE';
                    break;
            }
        }
        return ret;
    };

    var _formatArray = function (obj, cur_depth, pad_val, pad_char) {
        var someProp = '';
        if (cur_depth > 0) {
            cur_depth++;
        }

        var base_pad = _repeat_char(pad_val * (cur_depth - 1), pad_char);
        var thick_pad = _repeat_char(pad_val * (cur_depth + 1), pad_char);
        var str = '';
        var val = '';

        if (typeof obj === 'object' && obj !== null) {
            if (obj.constructor && _getFuncName(obj.constructor) === 'PHPJS_Resource') {
                return obj.var_dump();
            }
            lgth = 0;
            for (someProp in obj) {
                lgth++;
            }
            str += 'array(' + lgth + ') {\n';
            for (var key in obj) {
                var objVal = obj[key];
                if (typeof objVal === 'object' && objVal !== null && !(objVal instanceof Date) && !(objVal instanceof RegExp) && !objVal.nodeName) {
                    str += thick_pad + '[' + key + '] =>\n' + thick_pad + _formatArray(objVal, cur_depth + 1, pad_val, pad_char);
                } else {
                    val = _getInnerVal(objVal, thick_pad);
                    str += thick_pad + '[' + key + '] =>\n' + thick_pad + val + '\n';
                }
            }
            str += base_pad + '}\n';
        } else {
            str = _getInnerVal(obj, thick_pad);
        }
        return str;
    };

    output = _formatArray(arguments[0], 0, pad_val, pad_char);
    for (i = 1; i < arguments.length; i++) {
        output += '\n' + _formatArray(arguments[i], 0, pad_val, pad_char);
    }
    exports.response += output;
}



