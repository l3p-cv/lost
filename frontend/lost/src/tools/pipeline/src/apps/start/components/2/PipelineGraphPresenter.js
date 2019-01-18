import { WizardTabPresenter } from 'l3p-frontend'

import Graph from 'pipRoot/Graph'
import DatasourceStartPresenter from 'pipRoot/nodes/datasource/start/DatasourceStartPresenter'
import AnnoTaskStartPresenter from 'pipRoot/nodes/annoTask/start/AnnoTaskStartPresenter'
import DataExportStartPresenter from 'pipRoot/nodes/dataExport/start/DataExportStartPresenter'
import VisualOutputStartPresenter from 'pipRoot/nodes/visualOutput/start/VisualOutputStartPresenter'
import ScriptStartPresenter from 'pipRoot/nodes/script/start/ScriptStartPresenter'
import LoopStartPresenter from 'pipRoot/nodes/loop/start/LoopStartPresenter'

import PipelineGraphView from './PipelineGraphView'
import appModel from '../../appModel'


class PipelineGraphPresenter extends WizardTabPresenter {
    constructor() {
        super()
        this.view = PipelineGraphView
        
        // MODEL-BINDING
        appModel.state.selectedTemplate.on('update', () => this.show())
        appModel.state.selectedTemplate.on('update', (data) => this.showTemplate(data))
    }
	// this method is similar to PipelineGraphPresenter.showPipeline of running-pipes-application.
    showTemplate(data: any) {
        // reset the the observable state data.
        appModel.reset()

        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()
        
        // create and render the graph.
        this.graph = new Graph(this.view.html.refs['dagre'])

        appModel.state.pipelineElements = data.elements.map(element => {
            if ('datasource' in element) {
                return new DatasourceStartPresenter(this.graph, element)
            } else if ('script' in element) {
                return new ScriptStartPresenter(this.graph, element)
            } else if ('annoTask' in element) {
                return new AnnoTaskStartPresenter(this.graph, element)
            } else if ('dataExport' in element) {
                return new DataExportStartPresenter(this.graph, element)
            } else if ('visualOutput' in element) {
                return new VisualOutputStartPresenter(this.graph, element)
            } else if ('loop' in element) {
                return new LoopStartPresenter(this.graph, element)
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
			this.graph.render()
        })
		
		// initialize every node. the nodes root reference will be updated.
		appModel.state.pipelineElements.forEach(({ node, id }) => {
			node.init(document.getElementById(id))
		})
		
		// center the graph.
	    this.graph.centerGraph()
    }
	isValidated(){
		return appModel.state.pipelineElements.every(element => {
			console.log('validating pipeline element:', element.node.model)
			return element.node.model.isValidated()
		})
	}
}
export default new PipelineGraphPresenter()