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
		this.model.status.on('update', text => {
			this.modal.html.refs['status'].textContent = text
		})
    }
    /**
     * @override
     */
    initModelBinding(){}
}