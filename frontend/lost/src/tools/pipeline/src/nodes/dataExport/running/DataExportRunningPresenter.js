import BaseNodePresenter from '../../BaseNodePresenter'

import DataExportRunningModel from './DataExportRunningModel'
import DataExportRunningView from './DataExportRunningView'
import DataExportRunningModal from './DataExportRunningModal'


export default class DataExportRunningPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new DataExportRunningModel(data)
		const view = new DataExportRunningView(model)
		const modal = new DataExportRunningModal(model)
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