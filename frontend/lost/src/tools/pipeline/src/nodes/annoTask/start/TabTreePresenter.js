import { WizardTabPresenter } from 'l3p-frontend'
import flattenTree from 'utils/graph-vis/flattenTree'

import TabTreeView from './TabTreeView'
console.log({flattenTree})

export default class TabTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
        
		this.view = new TabTreeView()

		nodeModel.controls.show4.on('update', () => this.show())
        
		// update bootstrap-tree.
		nodeModel.state.selectedLabelTree.on('update', (data) => {
			console.log('raw data:', data)
			// map data for bootstrap-tree.
			data = flattenTree(data)
			console.log('flattend data:', data)
			this.view.update(data)
		})
    }
}
