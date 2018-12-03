import BaseNodePresenter from '../BaseNodePresenter'

import LoopNodeModel from './LoopNodeModel'
import LoopRunningView from './LoopRunningView'
import LoopStartView from './LoopStartView'
import LoopRunningModal from './LoopRunningModal'
import LoopStartModal from './LoopStartModal'


export default class LoopNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {      
        super(graph)
		let model = new LoopNodeModel(data, mode)
		let view = undefined
		let modal = undefined
		if(mode === 'start'){
			view = new LoopStartView(this.model)
			modal = new LoopStartModal(this.model)
		}
		if(mode === 'running'){
			view = new LoopRunningView(this.model)
			modal = new LoopRunningModal(this.model)
		}
		super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		if(this.model.mode === 'start'){
			$(this.modal.html.refs['max-iteration']).on('input', (e)=>{
				this.model.loop.maxIteration = e.currentTarget.value
			})
		}
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
            this.model.state.on('update', text => {
                this.modal.html.refs['state'].textContent = text
            })
		}
    }
    /**
     * @override
     */
    initModelBinding(){}
}