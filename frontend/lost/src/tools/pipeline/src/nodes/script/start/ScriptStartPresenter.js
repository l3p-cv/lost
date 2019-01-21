import BaseNodePresenter from '../../BaseNodePresenter'

import ScriptStartModel from './ScriptStartModel'
import ScriptStartView from './ScriptStartView'
import ScriptStartModal from './ScriptStartModal'


export default class ScriptStartPresenter extends BaseNodePresenter {
    constructor(graph, data) {
		const model = new ScriptStartModel(data)
		const view = new ScriptStartView(model)
		const modal = new ScriptStartModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.root).on('hidden.bs.modal', () => {
			this.view.setColor(this.isValidated())
		})
	}
	/**
     * @override
     */
    initModelBinding(){}
}





