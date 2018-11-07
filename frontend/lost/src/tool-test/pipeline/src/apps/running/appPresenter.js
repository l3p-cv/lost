import appModel from "./appModel"
import * as data from "core/data"

import Wizard from "wizard/Wizard"
import SelectPipelineTab from "./components/1/SelectPipelinePresenter"
import PipelineGraphTab from "./components/2/PipelineGraphPresenter"
import ConfigPipelineTab from "./components/3/ConfigPipelinePresenter"
import StartPipelineTab from "./components/4/StartPipelinePresenter"
import "../../../node_modules/sweetalert2/dist/sweetalert2.css"

const wizard = new Wizard("pipe-running-content")
PipelineGraphTab.requiresValid(SelectPipelineTab)
wizard.add([
    SelectPipelineTab, 
    PipelineGraphTab, 
])  

export function init(params) {
    if(params.isCompleted){
        data.requestCompletedPipes(params.isDebug).then((response) => {
            // load stored data
            const initialized = JSON.parse(sessionStorage.getItem("app-initialized")) !== null
            const currentState = JSON.parse(sessionStorage.getItem("app-current-state"))
            const isCurrentStateSaved = currentState !== null
    
            // arrange data source
            const refresh = (initialized) ? true : false
            if (refresh) {
            } else {
                appModel.isDebug = params.isDebug
                appModel.isCompleted = true
                appModel.data.pipelineTemplates.update(response.pipes)
            }
        })
    } else {
        data.requestRunningPipes(params.isDebug).then((response) => {
            // load stored data
            const initialized = JSON.parse(sessionStorage.getItem("app-initialized")) !== null
            const currentState = JSON.parse(sessionStorage.getItem("app-current-state"))
            const isCurrentStateSaved = currentState !== null
    
            // arrange data source
            const refresh = (initialized) ? true : false
            if (refresh) {
            } else {
                appModel.isDebug = params.isDebug
                appModel.isCompleted = false
                appModel.data.pipelineTemplates.update(response.pipes)
            }
        })
    }
}
