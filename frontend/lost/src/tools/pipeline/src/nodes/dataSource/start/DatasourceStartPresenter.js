import BaseNodePresenter from '../../BaseNodePresenter'

import DatasourceNodeModel from './DatasourceStartModel'
import DatasourceNodeStartView from './DatasourceStartView'
import DatasourceNodeStartModal from './DatasourceStartModal'


export default class DatasourceStartPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any){
		const model = new DatasourceNodeModel(data)
		const view = new DatasourceNodeStartView(model)
		const modal = new DatasourceNodeStartModal(model)
        super({ graph, model, view, modal })
    }
    /**
     * @override
     */
    initViewBinding(){
		// change path in model.
		$(this.modal.html.root).on('hidden.bs.modal', () => {
			const path = this.modal.getSelectedPath()
			this.model.state.path.update(path)
		})
    }
    /**
     * @override
     */
    initModelBinding(){
		// change path in view.
		this.model.state.path.on('update', (path) => {
			this.view.update(path)
			this.view.setColor(this.isValidated())
		})
    }
}