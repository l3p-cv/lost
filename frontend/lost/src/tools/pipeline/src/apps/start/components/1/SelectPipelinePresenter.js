import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'
import appModel from '../../appModel'
import SelectPipelineView from './SelectPipelineView'
import * as http from 'pipRoot/http'



class SelectPipelinePresenter extends WizardTabPresenter {
    constructor(){
        super()
        this.view = SelectPipelineView

        this.tableLoaded = false

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
        return this.tableLoaded
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
        this.tableLoaded = true
    }
	adjustDataTable(){
		this.view.adjustDataTable()
	}
    selectTemplate(id){
		http.requestTemplate(id).then(response => {
			appModel.state.selectedTemplate.update(response)
		})
	}
}
export default new SelectPipelinePresenter()