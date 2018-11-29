import BaseNodePresenter from '../BaseNodePresenter'
import DatasourceNodeModel from './DatasourceNodeModel'

import DatasourceNodeRunningView from './views/DatasourceNodeRunningView'
import DatasourceNodeStartView from './views/DatasourceNodeStartView'

import DatasourceNodeRunningModal from './modals/DatasourceNodeRunningModal'
import DatasourceNodeStartModal from './modals/DatasourceNodeStartModal'

import appModel from 'start/appModel'


export default class DatasourceNodePresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String) {
        super(graph)                            
        // create model.
        this.model = new DatasourceNodeModel(data, mode)

        // create view.
		if(mode === 'running'){
			this.view = new DatasourceNodeRunningView(this.model)
			this.modal = new DatasourceNodeRunningModal(this.model)
			$(this.modal.html.refs['more-information-link']).on('click', () =>{
				$(this.modal.html.refs['collapse-this']).collapse('toggle')
				$(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
			})
		} else if(mode === 'start'){
			this.view = new DatasourceNodeStartView(this.model)
			this.modal = new DatasourceNodeStartModal(this)
			$(this.modal.html.root).on('shown.bs.modal',() => {
				if(this.modal.html.refs['path-input']){
					this.modal.html.refs['path-input'].focus()
				}
			})
			$(this.modal.html.root).on('hidden.bs.modal',() => {
				this.graph.updateNode(this)           
			})
		} else {
			// THROW THIS ELSEWHERE. => MODEL. => CREATE BASE MODEL? / CREATE TESTS INSTEAD? YES.
			throw new Error('Invalid mode')
		}

		// trigger graph validation check after node validation change.
		// update node header color.
		this.model.state.validated.on('change', validated => {
			if(validated){
				appModel.state.checkNodesValidation.update(true)
				this.view.setColor(validated)
			}
		})
    }
    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof DatasourceNodeRunningView){
            $(this.view.html.root).on('click', $event => {
                console.warn('CLICK')
            })
			
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
    /**
     * @override
     */
    initModelBinding(){
    }
}