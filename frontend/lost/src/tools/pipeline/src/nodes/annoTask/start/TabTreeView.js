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

		// http://visjs.org/docs/network/nodes.html#
		this.options = {
			autoResize: true,
			height: '500px',
			layout: {
				hierarchical: {
					enabled: true,
					sortMethod: 'directed',
				},
			},
			nodes: {
				// override node hovering and selection style change: only style parents.
				chosen: {
					node: (values, id) =>{
						if(!this.isLeaf(id)){
							values.borderWidth = 3
						}
					},
					label: (values, id) =>{
						if(!this.isLeaf(id)){
							values.mod = 'bold'
						}
					},
				},
			},
			edges: {
				// disable edge hovering and selection.
				chosen: {
					edge: false,
				},
			},
			interaction: {
				hover: false,
				hoverConnectedEdges: false,
				selectConnectedEdges: false,
			}
		}
    }
	isLeaf(nodeId){
		const connectedEdges = this.graph.getConnectedEdges(nodeId)
		return (connectedEdges.length <= 2)
	}
	update(data){
		this.graph = new Network(this.html.refs['vis-graph'], data, this.options)
	}
}