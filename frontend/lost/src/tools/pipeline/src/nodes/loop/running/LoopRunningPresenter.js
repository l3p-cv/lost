import BaseNodePresenter from '../../BaseNodePresenter'

import LoopRunningModel from './LoopRunningModel'
import LoopRunningView from './LoopRunningView'
import LoopRunningModal from './LoopRunningModal'


export default class LoopRunningPresenter extends BaseNodePresenter {
    constructor(graph, data) {      
        super(graph)
		const model = new LoopRunningModel(data)
		const view = new LoopRunningView(this.model)
		const modal = new LoopRunningModal(this.model)
		super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
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
    /**
     * @override
     */
    initModelBinding(){}
}