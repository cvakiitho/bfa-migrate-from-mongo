const { toXML } = require('jstoxml');
const fs = require('fs');
var jsonFail = require('./failure_cause.js').kb


let result = new Object([])
for (el of jsonFail){
    try {
        delete el.lastOccurred
        delete el._id
        delete el._removed
        delete el.modifications
        delete el.comment
        //fix indications
        for (ind of el.indications){
            ind._name = ind['@class']
            delete ind['@class']
            ind._content = {
                _name: 'pattern',
                _content: ind.pattern
            }
            delete(ind.pattern)
        }
    }
        catch (e){console.error(e)}

    let temp = Object.assign(el)
    //structure
    result.push({
        _name: 'causes',
        _content: {
          _name: 'entry',
          _content: {
            _name: 'com.sonyericsson.jenkins.plugins.bfa.model.FailureCause',
            _content: temp
          }
        }

    })
    console.dir(result)
}

//console.dir(jsonFail)
//
//
const xmlOptions = {
      header: false,
      indent: '  '
};

var xml = toXML(result, xmlOptions)

fs.writeFileSync('./result.xml', xml)



