import BaseNodePresenter from '../../BaseNodePresenter'

import AnnoTaskStartModel from './AnnoTaskStartModel'
import AnnoTaskStartView from './AnnoTaskStartView'
import AnnoTaskStartModal from './AnnoTaskStartModal'


export default class AnnoTaskStartPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any){
		const model = new AnnoTaskStartModel(data)
		const view = new AnnoTaskStartView(model)
		const modal = new AnnoTaskStartModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.root).on('hidden.bs.modal', () => {
			this.view.updateName(this.model.state.name)
			this.view.updateAssignee(this.model.state.assignee.value)
			this.view.setColor(this.isValidated())
		})
	}
    /**
     * @override
     */
    initModelBinding(){}
}