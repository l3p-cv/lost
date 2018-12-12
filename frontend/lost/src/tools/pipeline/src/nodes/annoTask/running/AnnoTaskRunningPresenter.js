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
		// open hidden node information.
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
		// update modal.
		this.model.progress.on('update', number => {
			// METHODS!!!
			this.modal.html.refs['progress-bar'].style.width = `${number}%`
			this.modal.html.refs['progress-bar-text'].textContent = `${number? number: 0}%`
			// METHODS!!!
		})
		this.model.state.on('update', text => {
			// METHODS!!!
			this.modal.html.refs['status'].textContent = text
			// METHODS!!!
		})
    }
}