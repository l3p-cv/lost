import { WizardTabPresenter, NodeTemplate } from 'l3p-frontend'

import * as http from 'pipRoot/http'
import Graph from 'pipRoot/Graph'

import appModel from '../../appModel'

import PipelineGraphView from './PipelineGraphView'

import DatasourceRunningPresenter from 'pipRoot/nodes/dataSource/running/DatasourceRunningPresenter'
import AnnoTaskRunningPresenter from 'pipRoot/nodes/annoTask/running/AnnoTaskRunningPresenter'
import DataExportRunningPresenter from 'pipRoot/nodes/dataExport/running/DataExportRunningPresenter'
import VisualOutputRunningPresenter from 'pipRoot/nodes/visualOutput/running/VisualOutputRunningPresenter'
import ScriptRunningPresenter from 'pipRoot/nodes/script/running/ScriptRunningPresenter'
import LoopRunningPresenter from 'pipRoot/nodes/loop/running/LoopRunningPresenter'


class PipelineGraphPresenter extends WizardTabPresenter {
    constructor(){
        super()
        this.view = PipelineGraphView

        // MODEL BINDINGS
        appModel.state.selectedPipeline.on('update', (data) => this.show())
        appModel.state.selectedPipeline.on('update', (data) => this.showPipeline(data))

        // VIEW BINDINGS
        // Delete Pipe.
        $(this.view.html.refs['btn-delete-pipeline']).on('click', () => {
			alert('not implemented')
        })
        // Pause Pipeline Updates.
        $(this.view.html.refs['btn-pause-pipe']).on('click', () => {
			this.view.togglePlayPause({ running: false })
			alert('not implemented')
        })
        // Continue Pipeline Updates.
        $(this.view.html.refs['btn-play-pipe']).on('click', () => {
			alert('not implemented')
			this.view.togglePlayPause({ running: true })
        })
        // Download Logfile.
        $(this.view.html.refs['btn-download-logfile']).on('click', () => {
			alert('not implemented')
        })
        // Toggle Infobox.
        $(this.view.html.refs['btn-toggle-infobox']).on('click', () => {
			// NOT FINISHED:
			// need to store state in model.
			this.view.toggleInfoBox({ enabled: false })
        })
    }
	// this method is similar to PipelineGraphPresenter.showTemplate of start-pipe-application.
    showPipeline(data: any){
		// cancel previous update interval.
		this.cancelUpdate()

        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()

       	// create and render the graph.
        this.graph = new Graph(this.view.html.refs['dagre'])
		appModel.state.graph = this.graph

		// REWORK THE INFO TABLE!
		// add pipeline information table to the graph's title.
		// console.log(this.graph.svg)
        this.graph.svg.root.appendChild(new NodeTemplate(/*html*/`
            <table class='table table-borderless'>
                <h3 style='text-align: center'><span class='label label-warning'>PAUSED</span></h3>
                <tbody>
                    <tr><td>Name:</td><td>${data.name}</td></tr> 
                    <tr><td>Author:</td><td>${data.userName}</td></tr> 
                    <tr><td>Id:</td><td>${data.id}</td></tr> 
                    <tr><td>Date:</td><td>${new Date(data.timestamp)}</td></tr>             
                    <tr><td>Description:</td><td>${data.description}</td></tr> 
                </tbody>  
            </table>
        `).fragment)

        // handle pipeline progress information.
        if(data.progress === 'PAUSED'){
			this.view.togglePlayPause({ running: false })
        } else {
			this.view.togglePlayPause({ running: true })
        }
		
        // create nodes from data.
		appModel.state.pipelineElements = data.elements.map(element => {
            if ('datasource' in element) {
                return new DatasourceRunningPresenter(this.graph, element)
            } else if ('script' in element) {
                return new ScriptRunningPresenter(this.graph, element)
            } else if ('annoTask' in element) {
                return new AnnoTaskRunningPresenter(this.graph, element)
            } else if ('dataExport' in element) {
                return new DataExportRunningPresenter(this.graph, element)
            } else if ('visualOutput' in element) {
                return new VisualOutputRunningPresenter(this.graph, element)
            } else if ('loop' in element) {
                return new LoopRunningPresenter(this.graph, element)
            }
			throw new Error(`Unknown element data. Not implemented.`)
		})

		// add nodes and add their generated ids (generated in Graph.js)
		appModel.state.pipelineElements = appModel.state.pipelineElements.map(node => {
            const nodeId = this.graph.addNode(node)
			return {
				id: nodeId,
				node: node,
			}
		})

		// add edges
        appModel.state.pipelineElements.forEach(({ node }) => {
            if (node.constructor.name === 'LoopStartPresenter') {
                this.graph.addEdge(node.model.peN, node.model.loop.peJumpId, true)
            }
            if (node.model.peOut !== null) {
                node.model.peOut.forEach(e => {
                    this.graph.addEdge(node.model.peN, e)
                })
            }
			// this.graph.render()
        })
		
		// initialize every node. the nodes root reference will be updated.
		appModel.state.pipelineElements.forEach(({ node, id }) => {
			node.init(document.getElementById(id))
		})
		
		// center the graph.
		this.graph.centerGraph()
        
		// enable update polling.
		if(appModel.options.polling.value.enabled){
			this.enableUpdate(appModel.options.polling.value.rate || 1000)
		}
    }
	cancelUpdate(){
		// cancel previous update interval.
		if(this.updateIntervalId !== undefined){
			clearInterval(this.updateIntervalId)
		}
	}
	enableUpdate(rate: Number){
		console.log('enable update')
		// start new update interval.
		this.updateIntervalId = setInterval(() => {
			// change update information label.
			$(this.view.html.refs['update-label']).fadeIn(200)

			// request update.
			http.requestPipeline(appModel.state.selectedPipeline.value.id, appModel.reactComponent.token).then(response => {
				// stop polling if backend has no data (returns a status string)
				if(typeof response === 'string'){
					clearInterval(this.updateIntervalId)
					$(this.view.html.refs['update-label']).delay(500).fadeOut(200)
					return
				}
				console.log('new data update:', response)
				// update the model of each graph node.
				appModel.state.pipelineElements.forEach((element, i) => {
					element = element.node
					const newData = response.elements[i]
					if(i === 0){
						console.log('--- model update check ---')
						console.log('model status before:', element.model.status.value)						
						element.model.status.update(newData.state)
						console.log('model status after:', element.model.status.value)						
						console.log('--- view reference check ---')
						window.hodor = element.view.html
						console.log(element.view.html.refs)
						console.log(element.view.html.root)
						console.log(element.view.html.refs['status'])
						console.log(element.view.html.root.querySelector(`[data-ref='status']`))
					} else {
						element.model.status.update(newData.state)
						if(element instanceof AnnoTaskRunningPresenter){
							element.model.progress.update(newData.annoTask.progress ? newData.annoTask.progress : 0)
						}
						if(element instanceof ScriptRunningPresenter){
							element.model.progress.update(newData.script.progress ? newData.script.progress : 0)
							element.model.errorMsg.update(newData.script.errorMsg ? newData.script.errorMsg : '')
						}
					}
				})
				
				// change update information label.
				$(this.view.html.refs['update-label']).delay(500).fadeOut(200)
			}).catch((error) => {
				clearInterval(this.updateIntervalId)
				throw error
			})
		}, rate)
	}
}
export default new PipelineGraphPresenter()