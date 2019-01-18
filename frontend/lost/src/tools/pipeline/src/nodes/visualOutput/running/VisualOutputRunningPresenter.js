import BaseNodePresenter from '../../BaseNodePresenter'

import VisualOutputRunningModel from './VisualOutputRunningModel'
import VisualOutputRunningView from './VisualOutputRunningView'
import VisualOutputRunningModal from './VisualOutputRunningModal'


export default class VisualOutputRunningPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new VisualOutputRunningModel(data)
		const view = new VisualOutputRunningView(model)
		const modal = new VisualOutputRunningModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){}
    /**
     * @override
     */
    initModelBinding(){}
}