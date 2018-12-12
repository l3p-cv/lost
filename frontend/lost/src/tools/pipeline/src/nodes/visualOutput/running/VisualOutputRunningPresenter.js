import BaseNodePresenter from '../../BaseNodePresenter'

import VisualOutputRunningModel from './VisualOutputRunningModel'
import VisualOutputRunningView from './VisualOutputRunningView'
import VisualOutputRunningModal from './VisualOutputRunningModal'


export default class VisualOutputRunningPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new VisualOutputRunningModel(data)
		const view = new VisualOutputRunningView(model)
		const modal = new VisualOutputRunningModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){}
    /**
     * @override
     */
    initModelBinding(){
		// DUPLICATION?
		this.model.state.on('update', text => {
			this.view.parentNode.querySelector(`[data-ref='status']`).setAttribute('class', `panel-footer 
				${ text === 'script_error'   ? 'bg-red'      : '' }
				${ text === 'pending'        ? 'bg-blue'     : '' }
				${ text === 'in_progress'    ? 'bg-orange'   : '' }
				${ text === 'finished'       ? 'bg-green'    : '' }`)
			this.view.parentNode.querySelector(`[data-ref='status-text']`).textContent = text.replace('_', ' ')
		})
	}
}