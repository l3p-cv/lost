import "./TabTreeStyle.scss"

import { WizardTabView } from 'l3p-frontend'
import { Network } from "vis"
// http://visjs.org/docs/network/


export default class TabTreeView extends WizardTabView {
    constructor(){
        super({
            title: 'Select Labels',
            icon: 'fa fa-tag fa-1x',
            content: /*html*/`
				<div data-ref='vis-graph'></div>
            `,
        })
		this.options = {
			autoResize: true,
			height: '500px',
			layout:{
				hierarchical:{
					enabled: true,
					sortMethod: 'directed'
				}
			}
		}
		this.selectedLeafs = new Set()
		this.selectedLabels = []
    }
	update(data){
		this.selectedLeafs.clear()
		this.data = data
		this.graph = new Network(this.html.refs['vis-graph'], this.data, this.options)
		this.graph.on('click', data => {
			// clear when not clicking on a node.
			if(data.nodes.length === 0){
				this.selectedLeafs.clear()
				this.selectedLabels = []
				return
			}
			
			console.log(data)
			// data.edges contains all edge ids of the selected node, if any.
			// one edge always connects 2 nodes. 
			// therefore we can get the connected nodes as 2d array of node ids.
			const connectedNodes2DArray = data.edges.map(edgeId => {
				return this.graph.getConnectedNodes(edgeId)
			})

			// to get rid of duplication, and to achive a simple data structure,
			// we can just add all elements of the 2d array to a new set. 
			// console.log('connectedNodes2DArray', connectedNodes2DArray)
			const connectedNodesSet = new Set()
			connectedNodes2DArray.forEach(nodes => {
				nodes.forEach(node => connectedNodesSet.add(node))
			})
			console.log('connectedNodesSet', connectedNodesSet)

			// then we create an array from the set.
			const connectedNodes = Array.from(connectedNodesSet)
			console.log('connectedNodes', connectedNodes)

			const leafNodes = connectedNodes.filter(nodeId => {
				const connectedEdges = this.graph.getConnectedEdges(nodeId)
				console.log('connectedEdges:', connectedEdges)
				if(connectedEdges.length === 1 || connectedEdges.length === 2){
					return true
				}
				return false
			})
			console.log('leafNodesIds', leafNodes)
			
			// select all labels
			this.selectLabels(leafNodes)
		})	
	}
	selectLabels(leafNodeIds: Array<Number>){
		// if not all nodes are selected, select them.
		if(leafNodeIds.some(id => this.selectedLeafs.has(id) === false)){
			leafNodeIds.forEach(id => this.selectedLeafs.add(id))
		}

		// all nodes are selected, unselect them.
		else if(leafNodeIds.every(id => this.selectedLeafs.has(id))){
			leafNodeIds.forEach(id => this.selectedLeafs.delete(id))
		}
		// update selected labels.
		// map selected leaf ids to labels.
		this.selectedLabels = Array.from(this.selectedLeafs)
			.map(nodeId => this.data.nodes.find(node => node.id === nodeId))
			.map(data => data.label)
			
		console.log('selected labels', this.selectedLabels)
		
		// select leafs (labels).
		this.graph.selectNodes(Array.from(this.selectedLeafs))
	}
}
