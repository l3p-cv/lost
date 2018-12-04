import { WizardTabPresenter } from 'l3p-frontend'

import Graph from 'pipRoot/Graph'
import DatasourceStartPresenter from 'pipRoot/nodes/datasource/start/DatasourceStartPresenter'
import AnnoTaskStartPresenter from 'pipRoot/nodes/annoTask/start/AnnoTaskStartPresenter'
import DataExportStartPresenter from 'pipRoot/nodes/dataExport/start/DataExportStartPresenter'
import VisualOutputStartPresenter from 'pipRoot/nodes/visualOutput/start/VisualOutputStartPresenter'
import ScriptStartPresenter from 'pipRoot/nodes/script/start/ScriptStartPresenter'
import LoopStartPresenter from 'pipRoot/nodes/loop/start/LoopStartPresenter'

import PipelineGraphView from './PipelineGraphView'
import ConfigPipelinePresener from '../3/ConfigPipelinePresenter'
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
        ConfigPipelinePresener.reset()

        this.isThereGraph = true

        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()
        
        // create and render the graph
        this.graph = new Graph(this.view.html.refs['dagre'])

        // dont recreate the graph it it allready exists
		// if(this.graph !== undefined){
		// 	this.graph.remove()
		// }

        // data.requestTemplate()
        const elements = data.elements
        const mode = 'start'        
        let nodes = []
        elements.forEach(element => {
            if ('datasource' in element) {
                nodes.push(new DatasourceStartPresenter(this.graph, element, mode))
            } else if ('script' in element) {
                nodes.push(new ScriptStartPresenter(this.graph, element, mode))
            } else if ('annoTask' in element) {
                nodes.push(new AnnoTaskStartPresenter(this.graph, element, mode))
            } else if ('dataExport' in element) {
                nodes.push(new DataExportStartPresenter(this.graph, element, mode))
            } else if ('visualOutput' in element) {
                nodes.push(new VisualOutputStartPresenter(this.graph, element, mode))
            } else if ('loop' in element) {
                nodes.push(new LoopStartPresenter(this.graph, element, mode))
            }
        })
		
		// add nodes and add their generated ids (generated in Graph.js)
		nodes = nodes.map(node => {
            const nodeId = this.graph.addNode(node)
			return {
				id: nodeId,
				node: node,
			}
		})

		// add edges
        nodes.forEach(({ node }) => {
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
		nodes.forEach(({ node, id }) => {
			node.init(document.getElementById(id))
		})
    
	    this.graph.centerGraph()
    }
	getNodes(){
		if(this.graph && this.graph.dagreD3Graph){
			return this.graph.dagreD3Graph._nodes
		}
		return null
	}
	isValidated(){
		const nodes = this.getNodes()
		if(nodes){
			return Object.values(nodes).every(graphNode => {
				console.log('validating node:', graphNode.node)
				return graphNode.node.model.isValidated()
			})
		}
		return false
	}
}
export default new PipelineGraphPresenter()