const {
  toXML
} = require('jstoxml');
const fs = require('fs');
var jsonFail = require('./failure_cause.js').kb

function uuid() {
  var chars = '0123456789abcdef'.split('');

  var uuid = [],
    rnd = Math.random,
    r;
  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
  uuid[14] = '4'; // version 4

  for (var i = 0; i < 36; i++) {
    if (!uuid[i]) {
      r = 0 | rnd() * 16;

      uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
    }
  }

  return uuid.join('');
}


let result = new Object([])
for (let el of jsonFail) {
  try {
    delete el.lastOccurred
    delete el._id
    delete el._removed
    delete el.modifications
    delete el.comment
    //fix indications
    for (let ind of el.indications) {
      ind._name = ind['@class']
      delete ind['@class']
      ind._content = {
        _name: 'pattern',
        _content: ind.pattern
      }
      delete(ind.pattern)
    }
  } catch (e) {
    console.error(e)
  }

  //rework category so it generated
  // <categories class="java.util.Arrays$ArrayList">                                                                                                                                                                     
  // <a class="string-array">                                                                           
  // <string>BQ5</string>                                                                             
  // <string>B5</string>                                                                             
  // </a>                                                                                               
  // </categories>
  let tempArray = []

  //retransform everthing
  for (let key in el){

    if(key == 'categories') {
      let resultCategory = {}
      resultCategory._content = {
        _name: 'a',
        _attrs: {class: 'string-array'},
        _content: {
          _name: 'string',
          _content: el.categories
        }
      }
      resultCategory._name = 'categories'
      tempArray.push({ _name: 'categories', 
        _attrs: {'class':'java.util.Arrays$ArrayList'},
        _content: {
          _name: 'a',
          _attrs: {class: 'string-array'},
          _content: {
            _name: 'string',
            _content: el.categories
          }
        }
      })
    } else {
      tempArray.push({ _name: key, 
        _content: el[key]
      })
    }
  }



  //uuid 
  let temp = tempArray
  // let temp = Object.assign(el)
  let id = uuid()
  temp.id = id

  //structure
  result.push({
    _name: 'entry',
    _content: [
      {
        string: id
      },
      {  _name: 'com.sonyericsson.jenkins.plugins.bfa.model.FailureCause',
        _content: temp
      }
    ]

  })
}
let resultForReal = {
  _name: 'causes',
  _content: result
}

const xmlOptions = {
  header: false,
  indent: '  '
};

var xml = toXML(resultForReal, xmlOptions)

var header = `<?xml version='1.1' encoding='UTF-8'?>
<com.sonyericsson.jenkins.plugins.bfa.PluginImpl plugin="build-failure-analyzer@1.27.1">
  <noCausesMessage>No problems were identified. If you know why this problem occurred, please add a suitable Cause for it.</noCausesMessage>
  <doNotAnalyzeAbortedJob>false</doNotAnalyzeAbortedJob>
  <knowledgeBase class="com.sonyericsson.jenkins.plugins.bfa.db.LocalFileKnowledgeBase">`
var footer = `
</knowledgeBase>
<nrOfScanThreads>3</nrOfScanThreads>
<maxLogSize>0</maxLogSize>
<testResultCategories></testResultCategories>
<sodVariables>
  <minimumSodWorkerThreads>0</minimumSodWorkerThreads>
  <maximumSodWorkerThreads>0</maximumSodWorkerThreads>
  <sodThreadKeepAliveTime>0</sodThreadKeepAliveTime>
  <sodWaitForJobShutdownTimeout>0</sodWaitForJobShutdownTimeout>
  <sodCorePoolNumberOfThreads>0</sodCorePoolNumberOfThreads>
</sodVariables>
</com.sonyericsson.jenkins.plugins.bfa.PluginImpl>`


fs.writeFileSync('./result.xml', header + xml + footer)
