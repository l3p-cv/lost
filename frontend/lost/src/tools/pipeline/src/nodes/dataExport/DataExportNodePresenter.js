import BaseNodePresenter from '../BaseNodePresenter'
import DataExportNodeModel from './DataExportNodeModel'

import DataExportRunningView from './views/DataExportRunningView'
import DataExportStartView from './views/DataExportStartView'

import DataExportRunningModal from './modals/DataExportRunningModal'
import DataExportStartModal from './modals/DataExportStartModal'


export default class DataExportNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {
        super(graph)                                    
        // create model
        this.model = new DataExportNodeModel(data, mode)
        // create view
        switch(mode){
            case 'running':
                this.view = new DataExportRunningView(this.model)
                this.modal = new DataExportRunningModal(this.model)
                break
            case 'start':
                this.view = new DataExportStartView(this.model)
                this.modal = new DataExportStartModal(this.model)
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }
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