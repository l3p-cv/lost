import '../../custom-index.scss'

// imports for wizard and datatables
import 'bootstrap'
import 'datatables.net'
import 'datatables.net-bs4/css/dataTables.bootstrap4.css'

import appModel from './appModel'
import * as http from 'pipRoot/http'

import { Wizard } from 'pipRoot/l3pfrontend/index'
import SelectPipelineTab from './components/1/SelectPipelinePresenter'
import PipelineGraphTab from './components/2/PipelineGraphPresenter'
import ConfigPipelineTab from './components/3/ConfigPipelinePresenter'
import StartPipelineTab from './components/4/StartPipelinePresenter'
import '../../../node_modules/sweetalert2/dist/sweetalert2.css'

const wizard = new Wizard('start-pipeline')
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
    http.requestTemplates().then((response) => {
        appModel.data.pipelineTemplates.update(response.templates)
    })
}


// // temporary, during layout repair | REMOVE LATER
// import { BaseModal } from 'pipRoot/l3pfrontend/index'
// import 'bootstrap'
// class TempModal extends BaseModal {
// 	constructor(params: any){
// 		super({
// 			title: 'my title',
// 			id: 'some-id',
// 			classes: 'hodor and fodor',
// 			content: /*html*/`
// 				<h2>some content</h2>
// 				<p>
// 					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
// 				</p>
// 			`
// 		})
// 		document.body.appendChild(this.view.fragment)
// 		$(this.view.root).modal()
// 	}
// }
// const modal = new TempModal()
// console.log(modal)