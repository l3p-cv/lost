import '../../custom-index.scss'
import '../../../node_modules/sweetalert2/dist/sweetalert2.css'	// remove?

import appModel from './appModel'
import * as http from 'pipRoot/http'

import { Wizard } from 'pipRoot/l3pfrontend/index'
import SelectPipelineTab from './components/1/SelectPipelinePresenter'
import PipelineGraphTab from './components/2/PipelineGraphPresenter'


const wizard = new Wizard('pipe-running-content')
PipelineGraphTab.requiresValid(SelectPipelineTab)
wizard.add([
    SelectPipelineTab, 
    PipelineGraphTab, 
])  

export function init(params) {
    if(params.isCompleted){
        http.requestCompletedPipes(params.isDebug).then((response) => {
            appModel.isDebug = params.isDebug
            appModel.isCompleted = true
            appModel.data.pipelineTemplates.update(response.pipes)
        })
    } else {
        http.requestRunningPipes(params.isDebug).then((response) => {
            appModel.isDebug = params.isDebug
            appModel.isCompleted = false
            appModel.data.pipelineTemplates.update(response.pipes)
        })
    }
}
