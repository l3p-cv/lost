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
	console.warn('DISABLE DEBUG MODE IN PRODUCTION')
}


const wizard = new Wizard("mount-point-start-pipeline")
export default function init({ token }){
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
    appModel.reactComponent.token = token
    http.requestTemplates(token).then((response) => {
        appModel.data.pipelineTemplates.update(response.templates)
    })
}
