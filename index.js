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

var header = `<?xml version='1.1' encoding='UTF-8'?>
<com.sonyericsson.jenkins.plugins.bfa.PluginImpl plugin="build-failure-analyzer@1.27.1">
  <noCausesEnabled>true</noCausesEnabled>
  <noCausesMessage>No problems were identified. If you know why this problem occurred, please add a suitable Cause for it.</noCausesMessage>
  <globalEnabled>true</globalEnabled>
  <doNotAnalyzeAbortedJob>false</doNotAnalyzeAbortedJob>
  <gerritTriggerEnabled>true</gerritTriggerEnabled>
  <slackNotifEnabled>false</slackNotifEnabled>
  <slackChannelName></slackChannelName>
  <slackFailureCategories>ALL</slackFailureCategories>
  <fallbackCategoriesAsString></fallbackCategoriesAsString>
  <knowledgeBase class="com.sonyericsson.jenkins.plugins.bfa.db.LocalFileKnowledgeBase">
`
var footer = `</knowledgeBase>
  <nrOfScanThreads>3</nrOfScanThreads>
  <maxLogSize>0</maxLogSize>
  <graphsEnabled>false</graphsEnabled>
  <testResultParsingEnabled>false</testResultParsingEnabled>
  <testResultCategories></testResultCategories>
  <sodVariables>
    <minimumSodWorkerThreads>1</minimumSodWorkerThreads>
    <maximumSodWorkerThreads>1</maximumSodWorkerThreads>
    <sodThreadKeepAliveTime>15</sodThreadKeepAliveTime>
    <sodWaitForJobShutdownTimeout>30</sodWaitForJobShutdownTimeout>
    <sodCorePoolNumberOfThreads>5</sodCorePoolNumberOfThreads>
  </sodVariables>
</com.sonyericsson.jenkins.plugins.bfa.PluginImpl>
`


fs.writeFileSync('./result.xml', header + xml + footer)



