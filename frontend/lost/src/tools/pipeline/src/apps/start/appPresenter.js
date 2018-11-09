import appModel from "./appModel"
import * as data from "pipRoot/core/data"

import Wizard from "wizard/Wizard"
import SelectPipelineTab from "./components/1/SelectPipelinePresenter"
import PipelineGraphTab from "./components/2/PipelineGraphPresenter"
import ConfigPipelineTab from "./components/3/ConfigPipelinePresenter"
import StartPipelineTab from "./components/4/StartPipelinePresenter"
import "../../../node_modules/sweetalert2/dist/sweetalert2.css"

const wizard = new Wizard("start-pipeline-mount")
PipelineGraphTab.requiresValid(SelectPipelineTab)
ConfigPipelineTab.requiresValid(PipelineGraphTab)
StartPipelineTab.requiresValid(ConfigPipelineTab)
wizard.add([
    SelectPipelineTab, 
    PipelineGraphTab, 
    ConfigPipelineTab, 
    StartPipelineTab
])

export default function init(token){
    appModel.state.token = token
    data.requestTemplates().then((response) => {
        appModel.data.pipelineTemplates.update(response.templates)
    })
}
