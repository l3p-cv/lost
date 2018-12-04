import BaseNodePresenter from '../../BaseNodePresenter'

import DatasourceNodeModel from './DatasourceStartModel'
import DatasourceNodeStartView from './DatasourceStartView'
import DatasourceNodeStartModal from './DatasourceStartModal'


export default class DatasourceStartPresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String){
		const model = new DatasourceNodeModel(data, mode)
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
			let path = $(this.modal.html.refs['file-tree']).treeview('getSelected')
			if(path.length === 1){
				path = path[0].text
			}
			this.model.state.path.update(path)
			// position?
			this.graph.updateNode(this)
		})
    }
    /**
     * @override
     */
    initModelBinding(){
		// change path in view.
		this.model.state.path.on('update', (path) => this.view.update(path))
    }
}