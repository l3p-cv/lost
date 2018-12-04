import { WizardTabPresenter, mapTree } from 'l3p-frontend'

import TabTreeView from './TabTreeView'


export default class TabTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
        
		this.view = new TabTreeView()

		nodeModel.controls.show4.on('update', () => this.show())
        
		// update bootstrap-tree.
		nodeModel.state.selectedLabelTree.on('update', (data) => {
			console.log('raw data:', data)
			// map data for bootstrap-tree.
			data = mapTree(data, {
				childrenKey: 'children',
				map: [['children', 'nodes'], ['name', 'text']]
			})
			data = [ data ]
			console.log('will update my views bootstrap-tree with:', data)
			this.view.update(data)
		})
    }
}
