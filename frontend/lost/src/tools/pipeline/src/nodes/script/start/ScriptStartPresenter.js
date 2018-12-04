import BaseNodePresenter from '../../BaseNodePresenter'

import ScriptStartModel from './ScriptStartModel'
import ScriptStartView from './ScriptStartView'
import ScriptStartModal from './ScriptStartModal'


export default class ScriptStartPresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {
		const model = new ScriptStartModel(data, mode)
		const view = new ScriptStartView(model)
		const modal = new ScriptStartModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		// add collapse functionallity.
		$(this.modal.html.refs['more-information-link']).on('click', () => {
			$(this.modal.html.refs['collapse-this']).collapse('toggle')
			$(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
		})
	}
	/**
     * @override
     */
    initModelBinding(){}
}





