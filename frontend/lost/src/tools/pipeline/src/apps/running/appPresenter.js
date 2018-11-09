import appModel from "./appModel"
import * as data from "pipRoot/core/data"

import Wizard from "wizard/Wizard"
import SelectPipelineTab from "./components/1/SelectPipelinePresenter"
import PipelineGraphTab from "./components/2/PipelineGraphPresenter"
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
            appModel.isDebug = params.isDebug
            appModel.isCompleted = true
            appModel.data.pipelineTemplates.update(response.pipes)
        })
    } else {
        data.requestRunningPipes(params.isDebug).then((response) => {
            appModel.isDebug = params.isDebug
            appModel.isCompleted = false
            appModel.data.pipelineTemplates.update(response.pipes)
        })
    }
}
