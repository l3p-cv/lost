import { WizardTabPresenter, ContextMenu } from 'l3p-frontend'

import * as http from 'pipRoot/http'
import appModel from '../../appModel'

import SelectPipelineView from './SelectPipelineView'


// time and date conversion.
import moment from 'moment'


class SelectPipelinePresenter extends WizardTabPresenter {
    constructor(){
        super()

        this.view = SelectPipelineView

        // MODEL-BINDINGS
		// update data-tables table.
        appModel.state.pipelines.on('update', (data) => this.updateTable(data))

        // VIEW-BINDINGS
		// load pipeline.
        $(this.view.html.refs['data-table']).on('click', 'tbody td', (e) => {
			// get id of selected pipeline.
        	const id = this.view.table.row($(e.currentTarget).parent()).data()[0]

			// show pipeline.
			this.showPipeline(id)
        })

		// open contextmenu.
        $(this.view.html.refs['data-table']).on('contextmenu', 'tbody td', (e) => {
            e.preventDefault()

			// get id of selected pipeline.
            const id = this.view.table.row($(e.currentTarget).parent()).data()[0]

			// open context menu.
			ContextMenu(e, 
				{
					name: 'Delete Pipeline',
					icon: 'fa fa-trash',
					fn: () => this.deletePipeline(id),
				},
				{
					id: 'pause',
					name: 'Pause Pipeline',
					icon: 'fa fa-pause',
					fn: () => this.pausePipeline(id),
				},
				{
					id: 'show',
					name: 'Show Pipeline',
					icon: 'fa fa-play',
					fn: () => this.showPipeline(id)
				},
				{
					name:'Download Logfile',
					icon:'fa fa-download',
					fn: () => this.downloadLogfile(id),
				}
			)
        })
    }
	isValidated(){
		return !appModel.state.selectedPipeline.isInInitialState
	}
    updateTable(data: Array<any>){
		// update data table.
		this.view.updateTable(data.map(pipe => {
				const { id, name, description, templateName, creatorName } = pipe
				
				// modify progress and date.
				let { progress, date } = pipe
				progress = /*html*/`
					<span class='label ${progress === 'ERROR' ? 'label-danger' : 'label-warning'}'>
						${progress}
					</span>
				`
				date = moment(new Date(date)).format('MMMM Do YYYY, HH:mm:ss')

				return [
					id,
					name,
					description,
					templateName,
					creatorName,
					progress,
					date,
				]
			})
		)
    }
	adjustDataTable(){
		this.view.adjustDataTable()
	}
    showPipeline(id: Number){
		http.requestPipeline(id, appModel.state.token).then(response => {
			appModel.state.selectedPipeline.update(response)
		})
    }
	deletePipeline(id: Number){
		alert('not implemented.')
	}
	pausePipeline(id: Number){
		alert('not implemented.')
	}
	downloadPipeline(id: Number){
		alert('not implemented.')
	}
}
export default new SelectPipelinePresenter()
