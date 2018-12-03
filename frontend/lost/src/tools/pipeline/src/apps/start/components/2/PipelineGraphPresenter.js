import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'

import Graph from 'pipRoot/Graph'
import DatasourceNodePresenter from 'pipRoot/nodes/datasource/DatasourceNodePresenter'
import AnnoTaskNodePresenter from 'pipRoot/nodes/annoTask/AnnoTaskNodePresenter'
import DataExportNodePresenter from 'pipRoot/nodes/dataExport/DataExportNodePresenter'
import VisualOutputNodePresenter from 'pipRoot/nodes/visualOutput/VisualOutputNodePresenter'
import ScriptNodePresenter from 'pipRoot/nodes/script/ScriptNodePresenter'
import LoopNodePresenter from 'pipRoot/nodes/loop/LoopNodePresenter'

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
                nodes.push(new DatasourceNodePresenter(this.graph, element, mode))
            } else if ('script' in element) {
                nodes.push(new ScriptNodePresenter(this.graph, element, mode))
            } else if ('annoTask' in element) {
                nodes.push(new AnnoTaskNodePresenter(this.graph, element, mode))
            } else if ('dataExport' in element) {
                nodes.push(new DataExportNodePresenter(this.graph, element, mode))
            } else if ('visualOutput' in element) {
                nodes.push(new VisualOutputNodePresenter(this.graph, element, mode))
            } else if ('loop' in element) {
                nodes.push(new LoopNodePresenter(this.graph, element, mode))
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
            if (node.constructor.name === 'LoopNodePresenter') {
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
		return this.graph.dagreD3Graph._nodes
	}
	isValidated(){
		return Object.values(this.getNodes()).every(graphNode => {
			console.log('validating node:', graphNode.node)
			return graphNode.node.model.isValidated()
		})
	}
}
export default new PipelineGraphPresenter()