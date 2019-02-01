import '../../custom-index.scss'

// imports for wizard and datatables
import 'bootstrap'
import 'datatables.net'
import 'datatables.net-bs4/css/dataTables.bootstrap4.css'

import appModel from './appModel'
import * as http from 'pipRoot/http'

import { Wizard } from 'l3p-frontend'
import SelectPipelineTab from './components/1/SelectPipelinePresenter'
import PipelineGraphTab from './components/2/PipelineGraphPresenter'

const DEBUG = true
if(DEBUG){
	window.appModel = appModel
	console.warn('DISABLE DEBUG MODE IN PRODUCTION')
}



const wizard = new Wizard("mount-point-running-pipelines")
export default function init({ token, polling }){
	PipelineGraphTab.requiresValid(SelectPipelineTab)
	SelectPipelineTab.on('after-activate', () => {
		SelectPipelineTab.adjustDataTable()
	})
	wizard.add([
		SelectPipelineTab, 
		PipelineGraphTab, 
	])  
    appModel.reactComponent.token = token
	appModel.options.polling.update(polling)
	http.requestPipelines(appModel.reactComponent.token).then((response) => {
		if(!response.pipes){
			throw new Error(`Backend returned no running pipelines.`)
		}
		appModel.state.pipelines.update(response.pipes)
	})
}
