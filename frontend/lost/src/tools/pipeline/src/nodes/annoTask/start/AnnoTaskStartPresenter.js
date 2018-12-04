import BaseNodePresenter from '../../BaseNodePresenter'

import AnnoTaskStartModel from './AnnoTaskStartModel'
import AnnoTaskStartView from './AnnoTaskStartView'
import AnnoTaskStartModal from './AnnoTaskStartModal'


export default class AnnoTaskStartPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String){
		const model = new AnnoTaskStartModel(data, mode)
		const view = new AnnoTaskStartView(model)
		const modal = new AnnoTaskStartModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.root).on('hidden.bs.modal', () => {
			this.view.html.refs['name'].textContent = this.model.state.name
			this.graph.updateNode(this)
		})
	}
    /**
     * @override
     */
    initModelBinding(){}
}