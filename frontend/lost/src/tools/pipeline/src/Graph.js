import { NodeTemplate } from 'pipRoot/l3pfrontend/index'
import './Graph.scss'

import * as d3 from 'd3'
import * as dagreD3 from '@cartok/dagre-d3'


const DEFAULT_PARAMS = {
    nodesep: 100,
    edgesep: 40,
    rankdir: 'TB',
    ranker: 'network-simplex',
}

let initCounter = 0
export default class Graph {
    constructor(mountPoint: Node | String, options: any){
        initCounter++

        // merge default options
        options = Object.assign({}, DEFAULT_PARAMS, options)

        // process mount point
        if(mountPoint instanceof HTMLElement){
            this.mountPoint = mountPoint
        } else if(typeof(mountPoint) === 'string'){
            this.mountPoint = document.getElementById(mountPoint)
        } else {
            throw new Error(`Parameter 'mountPoint' has invalid type, use 'String' or 'Node'`)
        }

        // only one graph may exist
        if(this.mountPoint.querySelector(`[data-type='graph']`) !== null) {
            this.mountPoint.firstElementChild.remove()
        }

        // validate width of the container where the graph gets appended.
        // the svg needs a container that as allready a computed width,
        // else the graph and its node wont get rendered propperly.
        // if a 'Node' is hidden (display: 'none') it has a width of 0.
        if(mountPoint.getBoundingClientRect().width === 0){
            throw new Error('Mount Element has no width.')
        }

        // create and append base svg
        this.id = `graph-${initCounter}`
        this.initialScale = 0.8
        this.marginTop = 50
        this.svg = new NodeTemplate(/*html*/`
            <svg data-type='graph' id='${this.id}'> // data-type?
                <g data-ref="dagre-graph"></g>
            </svg>
        `)
        this.mountPoint.appendChild(this.svg.fragment)

        // add d3 selection references
        this.d3SelectionSvg = d3.select(this.svg.root)
        this.d3SelectionGroup = d3.select(this.svg.refs["dagre-graph"])

        // create and dagreD3 graph
        this.dagreD3Graph = new dagreD3.graphlib.Graph().setGraph(options)
        this.dagreD3Graph.graph().transition = (selection) => selection.transition().duration(1000)
    
        // add pan and zoom to svg group
		this.d3Zoom = new d3.zoom()
		this.d3Zoom.on('zoom', event => this.d3SelectionGroup.attr('transform', d3.event.transform))
		// set min and max zoom
		this.d3Zoom.scaleExtent([0.1, 1.1])

		// disable doubleclick zoom
        this.d3SelectionSvg.call(this.d3Zoom).on('dblclick.zoom', null)
		
        this.resize()
        $(window).on('resize', () => this.resize())
    }
    resize(){
        this.width = this.mountPoint.getBoundingClientRect().width // some error, gets bit to wide
        this.height = window.innerHeight - this.svg.root.getBoundingClientRect().top - this.marginTop
        this.svg.root.setAttribute('width', this.width)
        this.svg.root.setAttribute('height', this.height)
        this.svg.refs['dagre-graph'].setAttribute('width', this.width)
        this.svg.refs['dagre-graph'].setAttribute('height', this.height)
        this.centerGraph()
    }
    remove(){
        this.svg.destroy()
    }
    centerGraph(){
        const x = (this.width / 2) - (this.dagreD3Graph.graph().width / 2) || 0
        const y = this.marginTop
		// center the graph
        this.d3SelectionGroup.attr('transform', `translate(${x}, ${y})`)
        this.render()
    }
    render(){
        dagreD3.render()(this.d3SelectionGroup, this.dagreD3Graph)
    }
	setNode(node: NodePresenter){
        // the nodeId is the id of the grouping element created by dagree
        const nodeId = `${this.id}-node-${node.model.peN}`
        this.dagreD3Graph.setNode(
            node.model.peN, {
                nodePresenter: node,
                id: nodeId,
                labelType: 'html',
                label: node.view.html.fragment,
                shape: 'rect',
                padding: 0
            }
        )
        this.render()
    }
    addNode(node: NodePresenter){
        const nodeId = `${this.id}-node-${node.model.peN}`
        this.setNode(node)
		// REMOVED & REPLACED BY DIFFERENT APPROACH, SEE PipelineGraphPresenter
        // give the node the created parents id
        // so that it can be used for events (click)
        // node.init(document.getElementById(nodeId))
		return nodeId
    }
    updateNode(node: NodePresenter){
        this.setNode(node)
    }
    addEdge(from, to, redline){
        // loop true or false peJump to draw red line
        if(redline === true) {
            var edge_style = 'stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;'
            var edge_arrow_style = 'fill: #f66; stroke: none;'
        } else {
            edge_style = ''
            edge_arrow_style = ''
        }

        this.dagreD3Graph.setEdge(from, to, {
            label: '',
            style: edge_style,
            arrowheadStyle: edge_arrow_style,
        })
        
        this.render()
    }
}
