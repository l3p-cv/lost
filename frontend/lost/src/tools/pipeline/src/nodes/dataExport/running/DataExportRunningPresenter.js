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
    initModelBinding(){
		this.model.state.on('update', text => {
			this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
				${ text === 'script_error'   ? 'bg-red'      : '' }
				${ text === 'pending'        ? 'bg-blue'     : '' }
				${ text === 'in_progress'    ? 'bg-orange'   : '' }
				${ text === 'finished'       ? 'bg-green'    : '' }`)
			this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
		})
    }
}