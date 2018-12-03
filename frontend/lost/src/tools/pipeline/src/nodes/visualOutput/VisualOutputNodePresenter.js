import BaseNodePresenter from '../BaseNodePresenter'

import VisualOutputNodeModel from './VisualOutputNodeModel'
import VisualOutputRunningView from './VisualOutputRunningView'
import VisualOutputStartView from './VisualOutputStartView'
import VisualOutputRunningModal from './VisualOutputRunningModal'


export default class VisualOutputNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode){
		let model = new VisualOutputNodeModel(data, mode)
		let view = undefined
		let modal = undefined
		if(mode === 'start'){
			view = new VisualOutputStartView(model) 
		}
		if(mode === 'running'){
			view = new VisualOutputRunningView(model)
			modal = new VisualOutputRunningModal(model)
		}
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
		if(this.model.mode === 'running'){
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
}