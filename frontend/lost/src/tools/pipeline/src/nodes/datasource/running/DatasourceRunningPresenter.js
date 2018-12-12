import BaseNodePresenter from '../../BaseNodePresenter'

import DatasourceRunningModel from './DatasourceRunningModel'
import DatasourceRunningView from './DatasourceRunningView'
import DatasourceRunningModal from './DatasourceRunningModal'


export default class DatasourceRunningPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any){
		const model = new DatasourceRunningModel(data)
		const view = new DatasourceRunningView(model)
		const modal = new DatasourceRunningModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		$(this.modal.html.refs['more-information-link']).on('click', () =>{
			$(this.modal.html.refs['collapse-this']).collapse('toggle')
			$(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
		})
    }
    /**
     * @override
     */
    initModelBinding(){
		this.model.state.on('update', text => {
			this.modal.html.refs['status'].textContent = text
		})
    }
}