var fs = require('fs');
eval(fs.readFileSync('routes/index.js').toString());

exports.ret = "";
exports.all = ["echo", "conditionals", "isset", "array", "functions", "includes"];
exports.css = "<style>.header{text-align:center;padding-bottom:10px;border-bottom:1px dashed; }h3{margin: 0;margin-bottom: 10px;margin-top: 10px;}h3:first-child{margin-top:0;}h4{margin:0; margin-left:10px;}.codePass{padding:20px;padding-top:5px;}.codeBlock{padding: 10px;font-weight:bold;border:1px dashed; margin-top:5px; margin-bottom: 5px;}</style>";
exports.bad = "DE0D0D";
exports.good = "159624";
exports.header = "<div class='header'>";
    exports.header += "Functional Tests:<br>";
    exports.header += "<a href='/test/'>ALL</a>";
    for (var i = 0; i < exports.all.length; i++) {
        exports.header += " - <a href='./"+exports.all[i]+"'>"+exports.all[i]+"</a>";
    }
exports.header += "</div>";

exports.runTest = function(req, res){
    exports.ret = "";
    if(req.param("specificTest") !== undefined){
        //IT IS A SPECIFIC TEST TO RUN
        if(exports[req.param("specificTest")] === undefined){
            exports.ret = "INVALID TEST!";
        }else{
            exports[req.param("specificTest")]();
        }
    }else{
        //RUN THEM ALL!!!!!
        for (var i = 0; i < exports.all.length; i++) {
            if(!exports[exports.all[i]]()){
                break;
            }
        }
    }
    exports.ret = exports.css+exports.header+exports.ret;
    res.send(exports.ret);
};

exports.runCodePass = function(expected, code){
    var results = "<h4>Code Pass Test:</h4>";
    results += "<div class='codePass'>";
    for (var i = 0; i < code.length; i++) {
        var color = exports.good;
        if(code[i] != expected[i]){
            color = exports.bad;
        }
        results += "<font color='#"+color+"'>";
        if(code[i] != expected[i]){
            results += "Line "+(i+1)+" FAILED!<br><br>";
            results += "Expected:<br><div class='codeBlock'>"+expected[i]+"</div><br>Got:<br><div class='codeBlock'>"+code[i]+"</div>";
        }else{
            results += "Line "+(i+1)+" Passed!";
        }
        results += "</font><br>";
        if(code[i] != expected[i]){
            results += "</div>";
            exports.ret += results;
            return false;
        }
    }
    results += "</div>";
    exports.ret += results;
    return true;
};

exports.runCodeResultTest = function(expected, code){
    var results = "<h4>Code Evaluation Test:</h4>";
    results += "<div class='codePass'>";
    var codeResults = "";
    exports.endResult = code;
    exports.runConvertedPHP(null, null);
    codeResults = exports.response;
    console.log(codeResults);
    if(codeResults !== expected){
        results += "<font color='#"+exports.bad+"'>";
        results += "FAILED!<br><br>";
        results += "Expected:<br><div class='codeBlock'>"+expected+"</div><br>Got:<br><div class='codeBlock'>"+codeResults+"</div>";
        results += "</font><br>";
        results += "</div>";
        exports.ret += results;
        return false;
    }else{
        results += "<font color='#"+exports.good+"'>";
        results += "Passed!";
        results += "</font><br>";
        results += "</div>";
        exports.ret += results;
    }
    return true;
};

exports.runTests = function(codePassExpected, codeResultExpected, code){
    if(exports.runCodePass(codePassExpected, code.split("\n"))){
        //CODE PASS WAS GOOD!
        exports.response = "";
        if(exports.runCodeResultTest(codeResultExpected, code)){
            //CODE RESULT WAS GOOD!
            return true;
        }
    }
    return false;
};

//PLACE TESTS HERE
exports.echo = function(){
    exports.ret += "<h3>Echo Test:</h3>";
    var codePassExpected = [
        "var var = \"Hello\";",
        "var var2 = \"World\";",
        "var amount = \"2.00\";",
        "",
        "exports.response += \"Hello\";",
        "exports.response += \"Hello World\";",
        "exports.response += \"2.00\";",
        "exports.response += \"2.00\";",
        "exports.response += var;",
        "exports.response += var+\" World\";",
        "exports.response += var+\" \"+var2;",
        "exports.response += \"$\"+amount;",
    ];
    var codeResultExpected = "";
    var code = exports.getFile("echo.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};

exports.conditionals = function(){
    exports.ret += "<h3>Conditional Test:</h3>";
    var codePassExpected = [
        'var hello = "hello";',
        'var world = "world";',
        '',
        'if("world" == "world"){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if("hello" == "world"){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if(hello == "world"){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if(world == "world"){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}'
    ];
    var codeResultExpected = "ValidInvalidInvalidValid";
    var code = exports.getFile("conditionals.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};

exports.array = function(){
    exports.ret += "<h3>Array Test:</h3>";
    var codePassExpected = [
        'var helloWorld = array(\'1\', \'2\', \'3\');',
        '',
        'if(helloWorld[0] == "1"){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if(helloWorld[0] === 1){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if(helloWorld[0] == helloWorld[1]){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'if(helloWorld[0] == (helloWorld[1] - 1)){',
        '    exports.response += "Valid";',
        '}else{',
        '    exports.response += "Invalid";',
        '}',
        '',
        'exports.response += "\\n";',
        '',
        'var crazyArray = array(',
        '    "Test" ,\'=>\', array(',
        '        1, 5, "Test", helloWorld[0]',
        '    ),',
        '    "Test2" ,\'=>\', "Test2+Value",',
        '    array(1, 2, 3),',
        '    "Test3" ,\'=>\', "Test3+Value",',
        '    "Big_Test" ,\'=>\', array(',
        '        1, 4,',
        '        array(',
        '            "Testing" ,\'=>\', true',
        '        )',
        '    )',
        ');',
        '',
        'var_dump(crazyArray);'
    ];
    var codeResultExpected = "ValidInvalidInvalidValid\narray(5) {\n    [0] =>\n    array(3) {\n            [0] =>\n            int(1)\n            [1] =>\n            int(2)\n            [2] =>\n            int(3)\n    }\n    [Test] =>\n    array(4) {\n            [0] =>\n            int(1)\n            [1] =>\n            int(5)\n            [2] =>\n            string(4) \"Test\"\n            [3] =>\n            string(1) \"1\"\n    }\n    [Test2] =>\n    string(11) \"Test2+Value\"\n    [Test3] =>\n    string(11) \"Test3+Value\"\n    [Big_Test] =>\n    array(3) {\n            [0] =>\n            int(1)\n            [1] =>\n            int(4)\n            [2] =>\n            array(1) {\n                    [Testing] =>\n                    bool(true)\n            }\n    }\n}\n";
    var code = exports.getFile("array.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};

exports.functions = function(){
    exports.ret += "<h3>Function Test:</h3>";
    var codePassExpected = [
        'function testingFunction(str){',
        '    return str;',
        '}',
        '',
        'exports.response += testingFunction("What a loop");',
        '',
        'function echoFromFunction(){',
        '    exports.response += "Testing";',
        '}',
        '',
        'echoFromFunction();'
    ];
    var codeResultExpected = "What a loopTesting";
    var code = exports.getFile("functions.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};

exports.includes = function(){
    exports.ret += "<h3>Includes Test:</h3>";
    var codePassExpected = [
        'var outsideVar = "Outside!";',
        '',
        'var hello = "Hello";',
        'exports.response += "I\'m included!";',
        'exports.response += hello;',
        'exports.response += outsideVar;'
    ];
    var codeResultExpected = "I'm included!HelloOutside!";
    var code = exports.getFile("includes.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};

exports.isset = function(){
    exports.ret += "<h3>IsSet Test:</h3>";
    var codePassExpected = [
        'var hello = true;',
        'if(isset(hello)){',
        '    exports.response += "Yep, it is set!";',
        '}else{',
        '    exports.response += "Nope, not set!";',
        '}',
        '',
        'if(isset(helloWorld)){',
        '    exports.response += "Yep, it is set!";',
        '}else{',
        '    exports.response += "Nope, not set!";',
        '}'
    ];
    var codeResultExpected = "Yep, it is set!Nope, not set!";
    var code = exports.getFile("isset.php");
    return exports.runTests(codePassExpected, codeResultExpected, code);
};



