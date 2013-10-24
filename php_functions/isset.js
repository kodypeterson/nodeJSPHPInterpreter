var isset = function(){
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
};