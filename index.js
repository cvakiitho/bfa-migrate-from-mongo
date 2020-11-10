var o2x = require('object-to-xml');
var jsonFail = require('./failure_cause.js')

for (el of jsonFail){
    try {
        delete el.lastOccured
        delete el.modifications
    }
        catch (e){}
}
console.dir(jsonFail)

//console.log(o2x(jsonFail));

