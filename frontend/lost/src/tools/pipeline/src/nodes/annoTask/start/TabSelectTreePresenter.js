import { WizardTabPresenter } from 'l3p-frontend'

import TabSelectTreeView from './TabSelectTreeView'

import appModel from 'apps/start/appModel'


export default class TabSelectTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
		
		this.model = nodeModel
        this.view = new TabSelectTreeView(this.model)

        // MODEL BINDINGS
        nodeModel.controls.show3.on('update', () => this.show())
        
		// INIT DATATABLE
		const data = appModel.state.selectedTemplate.value.availableLabelTrees
        this.view.updateTable(data.map(template => {
            let { idx, name, description, timestamp } = template
			// apply default values.
			timestamp = timestamp ? new Date(timestamp) : '-'
			name = name || '-'
            return [
                idx,
                name,
                description,
                timestamp,
            ]
        }))

        // VIEW BINDINGS
        $(this.view.html.refs['data-table']).find('tbody').on('click', 'tr', $event => {

			// mark row as selected.
			this.view.selectRow($event.currentTarget)

			// get tree id of selected row as integer.
			// use it to find the related label tree.
			// update the nodes model.
			const treeId = parseInt($($event.currentTarget.children[0]).text())
			const treeData = appModel.state
				.selectedTemplate.value
				.availableLabelTrees.find(tree => tree.idx === treeId)
			if(treeData){
				nodeModel.state.selectedLabelTree.update(treeData)
			} else {
				throw new Error(`Label tree with id ${treeId} not found in selected pipeline template.`)
			}
			
			// show next tab pane
            nodeModel.controls.show4.update(true)
        })
    }
    isValidated(){
		return !this.model.state.selectedLabelTree.isInInitialState
    }
	adjustDataTable(){
		this.view.adjustDataTable()
	}
}