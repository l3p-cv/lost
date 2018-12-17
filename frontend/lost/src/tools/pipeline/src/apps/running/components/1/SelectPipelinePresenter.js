import { WizardTabPresenter } from 'l3p-frontend'

import moment from 'moment'

import * as http from 'pipRoot/http'
import appModel from '../../appModel'

import SelectPipelineView from './SelectPipelineView'

// DEV TESTS
import { ContextMenu } from 'pipRoot/l3pfrontend/index'
// DEV TESTS

class SelectPipelinePresenter extends WizardTabPresenter {
    constructor(){
        super()

        this.view = SelectPipelineView

        // MODEL-BINDINGS
		// data table update.
        appModel.state.pipelines.on('update', (data) => this.updateTable(data))

        // VIEW-BINDINGS
		// load pipeline.
        $(this.view.html.refs['data-table']).on('click', 'tbody td', (e) => {
        	const pipelineId = this.view.table.row($(e.currentTarget).parent()).data()[0]
            if($(e.currentTarget).text() !== 'Delete Pipeline'){
                this.showPipeline(pipelineId)
            }
        })

		// open contextmenu.
        $(this.view.html.refs['data-table']).on('contextmenu', 'tbody td', (e) => {
            e.preventDefault()
            const pipelineId = this.view.table.row($(e.currentTarget).parent()).data()[0]
            const row = this.view.table.row($(e.currentTarget).parent())

            function deletePipeline(){
                http.deletePipe(pipelineId, appModel.state.token).then((isSuccess) => {
                    if(isSuccess === 'cancel'){
                        return
                    } else {
                        row.remove().draw(false)                        
                    }
                })
            }
            function downloadLogfile(){
                if(this.rawData[0].logfilePath){
                    window.location = `${window.location.origin}/${this.rawData[0].logfilePath}`
                }
            }

            if(appModel.isCompleted){
                ContextMenu(e, 
					{
						name: 'Delete Pipeline',
						icon: 'fa fa-trash',
						fn: () => deletePipeline(),
					},
					{
						name:'Download Logfile',
						icon:'fa fa-download',
						fn: () => downloadLogfile(),
					}
				)
            } else {
                ContextMenu(e, 
					{
						name: 'Delete Pipeline',
						icon: 'fa fa-trash',
						fn: () => deletePipeline(),
					},
					{
						id: 'pause',
						name: 'Pause Pipeline',
						icon: 'fa fa-pause',
						fn: () => {
							console.warn('no backend service available atm?')
							// http.pausePipe({ 'pipeId': pipelineId }, appModel.state.token).then(result => {
							// 	if(result){
							// 		window.location.reload()
							// 	}
							// })   
						}
					},
					{
						id: 'show',
						name: 'Show Pipeline',
						icon: 'fa fa-play',
						fn: () => this.showPipeline(pipelineId)
					},
					{
						name:'Download Logfile',
						icon:'fa fa-download',
						fn: () => downloadLogfile(),
					}
				)
            }
        })
    }
    updateTable(rawData){
		// TO MODEL???
		// update data. 
		// only used for log file.
        this.rawData = rawData
		// TO MODEL???

		// update data table.
		this.view.updateTable(
			rawData.map(pipe => {
				const { id, name, description, templateName, creatorName } = pipe
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
		console.log('will request pipeline with id:', id)
		http.requestPipeline(id, appModel.state.token).then(response => {
			appModel.state.selectedPipeline.update(response)
		})
    }
}
export default new SelectPipelinePresenter()
