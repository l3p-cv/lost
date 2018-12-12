import BaseNodePresenter from '../../BaseNodePresenter'

import DataExportStartModel from './DataExportStartModel'
import DataExportStartView from './DataExportStartView'


export default class DataExportStartPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new DataExportStartModel(data)
		const view = new DataExportStartView(model)
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