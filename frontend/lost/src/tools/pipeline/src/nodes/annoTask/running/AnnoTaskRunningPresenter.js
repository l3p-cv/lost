import BaseNodePresenter from '../../BaseNodePresenter'

import AnnoTaskRunningModel from './AnnoTaskRunningModel'
import AnnoTaskRunningView from './AnnoTaskRunningView'
import AnnoTaskRunningModal from './AnnoTaskRunningModal'


export default class AnnoTaskRunningPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any){
		const model = new AnnoTaskRunningModel(data)
		const view = new AnnoTaskRunningView(model)
		const modal = new AnnoTaskRunningModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.refs['more-information-link']).on('click', () =>{
			$(this.modal.html.refs['collapse-this']).collapse('toggle')
			$(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
		})
    }
    /**
     * @override
     */
	// TODO: CALL VIEW METHODS INSTEAD!
    initModelBinding(){
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