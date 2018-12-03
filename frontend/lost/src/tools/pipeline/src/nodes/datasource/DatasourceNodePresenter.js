import BaseNodePresenter from '../BaseNodePresenter'

import DatasourceNodeModel from './DatasourceNodeModel'
import DatasourceNodeRunningView from './DatasourceNodeRunningView'
import DatasourceNodeStartView from './DatasourceNodeStartView'

import DatasourceNodeRunningModal from './DatasourceNodeRunningModal'
import DatasourceNodeStartModal from './DatasourceNodeStartModal'

import appModel from 'start/appModel'


export default class DatasourceNodePresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String){
		let model = new DatasourceNodeModel(data, mode)
		let view = undefined
		let modal = undefined

		if(mode === 'start'){
			view = new DatasourceNodeStartView(model)
			modal = new DatasourceNodeStartModal(model)
		}
		if(mode === 'running'){
			view = new DatasourceNodeRunningView(model)
			modal = new DatasourceNodeRunningModal(model)
		}
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		if(this.model.mode === 'start'){
			// PATH TO MODEL
			$(this.modal.html.root).on('hidden.bs.modal', () => {
				let path = $(this.modal.html.refs['file-tree']).treeview('getSelected')
				console.log({path})
				if(path.length === 1){
					path = path[0].text
				}
				this.model.state.path.update(path)
				this.graph.updateNode(this)           
			})
		}
		if(this.model.mode === 'running'){
			$(this.modal.html.refs['more-information-link']).on('click', () =>{
				$(this.modal.html.refs['collapse-this']).collapse('toggle')
				$(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
			})
		}
    }
    /**
     * @override
     */
    initModelBinding(){
		// PATH TO VIEW
		if(this.model.mode === 'start'){
			this.model.state.path.on('update', (path) => this.view.setSource(path))
		}
		// DUPLICATION?
		if(this.model.mode === 'running'){
			this.model.state.on('update', text => {
				this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
					${ text === 'script_error'   ? 'bg-red'      : '' }
					${ text === 'pending'        ? 'bg-blue'     : '' }
					${ text === 'in_progress'    ? 'bg-orange'   : '' }
					${ text === 'finished'       ? 'bg-green'    : '' }`)
				this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
			})
			this.model.state.on('update', text => {
				this.modal.html.refs['state'].textContent = text
			})
		}
    }
}