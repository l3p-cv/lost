import BaseNodePresenter from '../BaseNodePresenter'

import AnnoTaskNodeModel from './AnnoTaskNodeModel'
import AnnoTaskRunningView from './AnnoTaskRunningView'
import AnnoTaskStartView from './AnnoTaskStartView'
import AnnoTaskRunningModal from './running/AnnoTaskRunningModal'
import AnnoTaskStartModal from './start/AnnoTaskStartModal'


export default class AnnoTaskNodePresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String){
		let model = new AnnoTaskNodeModel(data, mode)
		let view = undefined
		let modal = undefined
		if(mode === 'start'){
			view = new AnnoTaskStartView(model)
			modal = new AnnoTaskStartModal(model)
		}
		if(mode === 'running'){
			view = new AnnoTaskRunningView(model)
			modal = new AnnoTaskRunningModal(model)
		}
		
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
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
	// TODO: VIEW METHODS!
    initModelBinding(){
		if(this.model.mode === 'running'){
            this.model.progress.on('update', number => {
                this.view.parentNode.querySelector(`[data-ref='progress-bar']`).style.width = `${number}%`
                this.view.parentNode.querySelector(`[data-ref='progress-bar-text']`).textContent = `${number}%`
            })
			// DUPLICATION?
            this.model.state.on('update', text => {
                this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
                    ${ text === 'script_error'   ? 'bg-red'      : '' }
                    ${ text === 'pending'        ? 'bg-blue'     : '' }
                    ${ text === 'in_progress'    ? 'bg-orange'   : '' }
                    ${ text === 'finished'       ? 'bg-green'    : '' }`)
                this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
            })
            this.model.progress.on('update', number => {
                this.modal.html.refs['progress-bar'].style.width = `${number}%`
                this.modal.html.refs['progress-bar-text'].textContent = `${number? number: 0}%`
            })
            this.model.state.on('update', text => {
                this.modal.html.refs['state'].textContent = text
            })
		}
    }
}