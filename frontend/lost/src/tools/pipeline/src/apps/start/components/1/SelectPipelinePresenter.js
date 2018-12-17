import { WizardTabPresenter } from 'l3p-frontend'
import * as http from 'pipRoot/http'

import appModel from '../../appModel'

import SelectPipelineView from './SelectPipelineView'



class SelectPipelinePresenter extends WizardTabPresenter {
    constructor(){
        super()
        this.view = SelectPipelineView

        // MODEL-BINDING
        appModel.controls.show1.on('update', () => this.show())
        appModel.data.pipelineTemplates.on('update', (data) => this.updateTable(data))

        // VIEW-BINDING
        $(this.view.html.refs["data-table"]).on('click', 'tr', (e) => {
            const id = this.view.table.row(e.currentTarget).data()[0]            
            this.selectTemplate(id)
        })
    }
    isValidated(){
		return !appModel.state.selectedTemplate.isInInitialState
    }
    updateTable(data){
        this.view.updateTable(data.map(template => {
            const { id, name, description, author, date } = template
            return [
                id,
                name,
                description,
                author,
                new Date(date),
            ]
        }))
    }
	adjustDataTable(){
		this.view.adjustDataTable()
	}
    selectTemplate(id){
		http.requestTemplate(id, appModel.state.token).then(response => {
			appModel.state.selectedTemplate.update(response)
		})
	}
}
export default new SelectPipelinePresenter()