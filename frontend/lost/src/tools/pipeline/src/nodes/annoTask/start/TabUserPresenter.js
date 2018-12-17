import { WizardTabPresenter } from 'l3p-frontend'

import TabUserView from './TabUserView'

import appModel from 'apps/start/appModel'


export default class TabUserPresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnotaskStartModel) {
        super()
		
		this.model = nodeModel
		// add icon to groups, pass groups to view to create a data table
		const groups = appModel.state.selectedTemplate.value.availableGroups.map(group => {
			const { id, groupName, isUserDefault } = group
			const icon = isUserDefault ? 'user-icon' : 'group-icon'
			return [
				id,
				groupName,
				icon,
			]
		})
        this.view = new TabUserView(groups)

		// MODEL BINDINGS
		nodeModel.controls.show2.on('update', () => this.show())

        // VIEW BINDINGS
        $(this.view.html.refs["data-table"]).find('tbody').on('click', 'tr', ($event) => {
			// mark row as selected
			this.view.selectRow($event.currentTarget)
			
			// update model on selection
            nodeModel.state.workerId = parseInt($($event.currentTarget.children[0]).text())
            nodeModel.state.assignee = $($event.currentTarget.children[1]).text()

			// show next tab pane
            nodeModel.controls.show3.update(true)
        })
    }
	isValidated(){
		let result = true
		result = result && !isNaN(this.model.state.workerId)
		result = result && this.model.state.assignee.length > 0
		return result
	}
	adjustDataTable(){
		this.view.adjustDataTable()
	}
}