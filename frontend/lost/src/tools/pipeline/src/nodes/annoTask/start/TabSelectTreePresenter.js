import { WizardTabPresenter } from 'l3p-frontend'

import TabSelectTreeView from './TabSelectTreeView'

import appModel from 'apps/start/appModel'


export default class TabSelectTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
		
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
        $(this.view.html.refs['table-tree']).find('tbody').on('click', 'tr', (e) => {
			// load labels

        })
    }
    isValidated(){
		return true
    }
	adjustDataTable(){
		this.view.adjustDataTable()
	}
}