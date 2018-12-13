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

        this.validated = false
        
        // MODEL-BINDING
        appModel.controls.show2.on('update', () => this.show())  
        appModel.state.selectedTemplate.on('update', (data) => this.loadTemplate(data))
    }
    // @override
    isValidated(){
        return this.validated 
    }
    loadTemplate(data: any) {
        // Reset the Data when graph was loaded seecond time
        appModel.reset()

        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()
        
        // create and render the graph
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
		console.log(appModel.state.pipelineElements.map(element => element.model))
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
		
		// finish node creation by using the node ids... blablabla explain this bullshit
		appModel.state.pipelineElements.forEach(({ node, id }) => {
			node.init(document.getElementById(id))
		})
    
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