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
        appModel.data.pipelineTemplates.on('update', (data) => this.updateTable(data))

        // VIEW-BINDINGS
		// load template.
        $(this.view.html.refs['templatetable']).on('click', 'tbody row', (e) => {
        	const templateId = this.view.table.row($(e.currentTarget).parent()).data()[0]
            if($(e.currentTarget).text() !== 'Delete Pipeline'){
                this.selectTemplate(templateId)
            }
        })

		// delete pipeline.
        $(this.view.html.refs['templatetable']).on('click', 'button', function (){
            const templateId = this.view.table.row($(this).parents('tr')).data()
            http.deletePipe(templateId)
        })

		// open row contextmenu.
        $(this.view.html.refs['templatetable']).on('contextmenu', 'tbody row', (e) => {
            e.preventDefault()
            const templateId = this.view.table.row($(e.currentTarget).parent()).data()[0]
            const row = this.view.table.row($(e.currentTarget).parent())

            function deletePipeline(){
                http.deletePipe(templateId).then((isSuccess) => {
                    if(isSuccess === 'cancel'){
                        return
                    } else {
                        row.remove().draw(false)                        
                    }
                })
            }
            function downloadLogfile(){
                if(this.rawData[0].logfilePath){
                    window.location = window.location.origin + '/' + this.rawData[0].logfilePath
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
							http.pausePipe({'pipeId': templateId}).then(success => {
								if(success){
									window.location.reload()
								}
							})   
						}
					},
					{
						id: 'play',
						name: 'Play Pipeline',
						icon: 'fa fa-play',
						fn: () => {
							http.playPipe({'pipeId': templateId}).then(success => {
								if(success){
									window.location.reload()
								}
							})                          
						}
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
        this.rawData = rawData
		// TO MODEL???

        // if user starts a pipe, show its graph.
        const pathname = window.location.pathname
		const templateId = parseInt(pathname.substring(pathname.lastIndexOf('/') + 1 , pathname.length))
		this.selectTemplate(templateId)

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
    selectTemplate(id: Node){
		http.requestPipeline(id).then(response => {
			appModel.state.selectedPipe.update(response)
		})
    }
}
export default new SelectPipelinePresenter()




