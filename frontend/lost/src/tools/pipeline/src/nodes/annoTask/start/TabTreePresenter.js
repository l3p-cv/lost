import { WizardTabPresenter, tree as Tree } from 'l3p-frontend'
import mapTreeToGraph from 'libs/graph-vis/mapTreeToGraph'

import TabTreeView from './TabTreeView'

export default class TabTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
        
		this.model = nodeModel
		this.view = new TabTreeView()

		// used to collect graph node ids.
		// these will be converted to label and then passed to the model.
		this.selectedNodeIds = new Set()

		// show this tab.
		nodeModel.controls.show4.on('update', () => this.show())
        
		// update label selection tree, and add event listener.
		nodeModel.state.selectedLabelTree.on('update', (tree) => {
			this.visData = mapTreeToGraph(tree, {
				// change leaf color.
				customizeNodes: nodes => {
					return nodes.map(node => {
						if(node.isLeaf === true){
							node.color.background = '#adadad'
							node.font.color = '#222222'
						}
						return node
					})
				}
			})
			console.log('vis data:', this.visData)

			// create graph.
			this.view.update(this.visData)
			// add event listener.
			this.view.graph.on('select', (data) => this.onLabelSelect(data))
		})
    }
	onLabelSelect(data){
		data.nodes.forEach(nodeId => {
			if(!this.view.isLeaf(nodeId)){
				if(this.selectedNodeIds.has(nodeId)){
					this.selectedNodeIds.delete(nodeId)
				} else {
					this.selectedNodeIds.add(nodeId)
				}
			}
		})
		this.view.graph.setSelection({ nodes: Array.from(this.selectedNodeIds) })
		// update model
		this.model.state.selectedLabels = Array.from(this.selectedNodeIds).map(id => ({
			id,
			maxLabels: '3', // wired.
		}))
	}
	isValidated(){
		return this.selectedNodeIds.size > 0
	}
}


// This function returns true if all 'terms' keys and values are found in 'node'.
function nodeMeetsConditions(node, terms){
	const nodeKeys = Object.keys(node)
	const termKeys = Object.keys(terms)
	const termKeysMatched = termKeys.every(key => nodeKeys.includes(key))
	if(!termKeysMatched){
		return false
	}
	const termValuesMatched = termKeys.every(key => node[key] === terms[key])
	if(!termValuesMatched){
		return false
	}
	return true
}
function findTreeNode(node, childrenKey, terms){
	if(nodeMeetsConditions(node, terms)){
		return node
	}
	for(let i = 0; i < node[childrenKey].length; i++){
		const result = findTreeNode(node[childrenKey][i], childrenKey, terms)
		if(result){
			return result
		}
	}
}
