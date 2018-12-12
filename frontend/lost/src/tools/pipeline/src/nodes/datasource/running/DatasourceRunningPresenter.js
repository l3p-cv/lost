import BaseNodePresenter from '../../BaseNodePresenter'

import DatasourceRunningModel from './DatasourceRunningModel'
import DatasourceRunningView from './DatasourceRunningView'
import DatasourceRunningModal from './DatasourceRunningModal'


export default class DatasourceRunningPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any){
		const model = new DatasourceRunningModel(data)
		const view = new DatasourceRunningView(model)
		const modal = new DatasourceRunningModal(model)
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
    initModelBinding(){
		// DUPLICATION?
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