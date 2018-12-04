import BaseNodePresenter from '../../BaseNodePresenter'

import LoopStartModel from './LoopStartModel'
import LoopStartView from './LoopStartView'
import LoopStartModal from './LoopStartModal'


export default class LoopStartPresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {      
        super(graph)
		const model = new LoopStartModel(data, mode)
		const view = new LoopStartView(this.model)
		const modal = new LoopStartModal(this.model)
		super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.refs['max-iteration']).on('input', (e)=>{
			this.model.loop.maxIteration = e.currentTarget.value
		})
    }
    /**
     * @override
     */
    initModelBinding(){}
}