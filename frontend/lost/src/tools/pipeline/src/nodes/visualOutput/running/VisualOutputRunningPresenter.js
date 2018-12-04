import BaseNodePresenter from '../../BaseNodePresenter'

import VisualOutputRunningModel from './VisualOutputRunningModel'
import VisualOutputRunningView from './VisualOutputRunningView'
import VisualOutputRunningModal from './VisualOutputRunningModal'


export default class VisualOutputRunningPresenter extends BaseNodePresenter {
    constructor(graph, data, mode){
		const model = new VisualOutputRunningModel(data, mode)
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
			this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
				${ text === 'script_error'   ? 'bg-red'      : '' }
				${ text === 'pending'        ? 'bg-blue'     : '' }
				${ text === 'in_progress'    ? 'bg-orange'   : '' }
				${ text === 'finished'       ? 'bg-green'    : '' }`)
			this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
		})
	}
}