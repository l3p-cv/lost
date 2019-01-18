import BaseNodePresenter from '../../BaseNodePresenter'

import LoopRunningModel from './LoopRunningModel'
import LoopRunningView from './LoopRunningView'
import LoopRunningModal from './LoopRunningModal'


export default class LoopRunningPresenter extends BaseNodePresenter {
    constructor(graph, data) {      
		const model = new LoopRunningModel(data)
		const view = new LoopRunningView(model)
		const modal = new LoopRunningModal(model)
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
		this.model.status.on('update', text => {
			this.modal.html.refs['status'].textContent = text
		})
	}
}