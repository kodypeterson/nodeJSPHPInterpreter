//NOT TRUELY A PHP FUNCTION BUT IT IS A SUPPORTING FUNCTION
var createClass = function(className, classContents, classExtends){
    var builder = function(){};
    if(classExtends !== undefined){
         //TODO: Implement class extensions
    }
    for (var key in classContents) {
        var temp = key.split("+");
        if(temp[1] != "function"){
            //THIS IS A VARIABLE
            builder[temp[1]] = classContents[key];
        }else{
            //THIS IS A FUNCTION
            var functionInfo = temp[2].split("(");
            var args = functionInfo[1].replace(")", "").split(",");
            var functionContent = "";
            for (var i = 0; i < classContents[key].length; i++) {
                functionContent += classContents[key][i];
            }
            if(typeof args !== 'string'){
                args = args.join(",");
            }
            var tempFunctionString = "function("+args+"){"+functionContent+"}";
            builder[functionInfo[0]] = eval("("+tempFunctionString+")");
        }
    }
    return builder;
};