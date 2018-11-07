import appModel from "./appModel"
import * as data from "core/data"

import Wizard from "wizard/Wizard"
import SelectPipelineTab from "./components/1/SelectPipelinePresenter"
import PipelineGraphTab from "./components/2/PipelineGraphPresenter"
import ConfigPipelineTab from "./components/3/ConfigPipelinePresenter"
import StartPipelineTab from "./components/4/StartPipelinePresenter"
import "../../../node_modules/sweetalert2/dist/sweetalert2.css"

const wizard = new Wizard("pipe-start-content")
PipelineGraphTab.requiresValid(SelectPipelineTab)
ConfigPipelineTab.requiresValid(PipelineGraphTab)
StartPipelineTab.requiresValid(ConfigPipelineTab)
wizard.add([
    SelectPipelineTab, 
    PipelineGraphTab, 
    ConfigPipelineTab, 
    StartPipelineTab
])


export function init(isDebug) {
    data.requestTemplates(isDebug).then((response) => {
        // load stored data
        const initialized = JSON.parse(sessionStorage.getItem("app-initialized")) !== null
        const currentState = JSON.parse(sessionStorage.getItem("app-current-state"))
        const isCurrentStateSaved = currentState !== null

        // arrange data source
        const refresh = (initialized) ? true : false
        if (refresh) {
        } else {
            appModel.isDebug = isDebug
            appModel.data.pipelineTemplates.update(response.templates)
        }
    })
}
