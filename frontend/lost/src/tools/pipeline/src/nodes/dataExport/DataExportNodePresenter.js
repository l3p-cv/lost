import BaseNodePresenter from '../BaseNodePresenter'

import DataExportNodeModel from './DataExportNodeModel'
import DataExportRunningView from './DataExportRunningView'
import DataExportStartView from './DataExportStartView'
import DataExportRunningModal from './DataExportRunningModal'


export default class DataExportNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode){
		let model = new DataExportNodeModel(data, mode)
		let view = undefined
		let modal = undefined
		
		if(mode === 'start'){
			view = new DataExportStartView(model)
		}
		if(mode === 'running'){
			view = new DataExportRunningView(model)
			modal = new DataExportRunningModal(model)
		}

        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof DataExportRunningView){
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
    /**
     * @override
     */
    initModelBinding(){
    }
}