var array = function(){
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
};