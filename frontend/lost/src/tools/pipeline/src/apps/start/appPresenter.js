import '../../custom-index.scss'

// imports for wizard and datatables
import 'bootstrap'
import 'datatables.net'
import 'datatables.net-bs4/css/dataTables.bootstrap4.css'

import '../../../node_modules/sweetalert2/dist/sweetalert2.css'

import appModel from './appModel'
import * as http from 'pipRoot/http'

import { Wizard } from 'l3p-frontend'
import SelectPipelineTab from './components/1/SelectPipelinePresenter'
import PipelineGraphTab from './components/2/PipelineGraphPresenter'
import ConfigPipelineTab from './components/3/ConfigPipelinePresenter'
import StartPipelineTab from './components/4/StartPipelinePresenter'

const DEBUG = true
if(DEBUG){
	window.appModel = appModel
}

const wizard = new Wizard('start-pipeline')
PipelineGraphTab.requiresValid(SelectPipelineTab)
ConfigPipelineTab.requiresValid(PipelineGraphTab)
StartPipelineTab.requiresValid(ConfigPipelineTab)

SelectPipelineTab.on('after-activate', () => {
	SelectPipelineTab.adjustDataTable()
})

wizard.add([
    SelectPipelineTab, 
    PipelineGraphTab, 
    ConfigPipelineTab, 
    StartPipelineTab,
])

export default function init(token){
    appModel.state.token = token
    http.requestTemplates(token).then((response) => {
        appModel.data.pipelineTemplates.update(response.templates)
    })
}
