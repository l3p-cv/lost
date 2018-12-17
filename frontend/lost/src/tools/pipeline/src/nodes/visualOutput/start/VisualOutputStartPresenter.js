import BaseNodePresenter from '../../BaseNodePresenter'

import VisualOutputStartModel from './VisualOutputStartModel'
import VisualOutputStartView from './VisualOutputStartView'


export default class VisualOutputStartPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new VisualOutputStartModel(data)
		const view = new VisualOutputStartView() 
        super({ graph, model, view })
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