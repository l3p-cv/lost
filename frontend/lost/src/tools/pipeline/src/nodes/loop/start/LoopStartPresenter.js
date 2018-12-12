import BaseNodePresenter from '../../BaseNodePresenter'

import LoopStartModel from './LoopStartModel'
import LoopStartView from './LoopStartView'
import LoopStartModal from './LoopStartModal'


export default class LoopStartPresenter extends BaseNodePresenter {
    constructor(graph, data) {      
        super(graph)
		const model = new LoopStartModel(data)
		const view = new LoopStartView(model)
		const modal = new LoopStartModal(model)
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