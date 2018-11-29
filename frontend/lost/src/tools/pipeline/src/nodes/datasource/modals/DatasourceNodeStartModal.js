import { BaseModal, mapTree } from 'pipRoot/l3pfrontend/index'

// bootstrap-tree does only support glyphicons as it seems.
// we dont have them.
// options to fix not having icons: 
// - buy glyphicons (-)
// - fork bootstrap-tree and fix / extend it (--)
// - build a tree component in our framework (+)
// - build a tree component in react (++)
import 'bootstrap-tree'
import 'bootstrap-tree/dist/bootstrap-treeview.min.css'
// https://github.com/jonmiles/bootstrap-treeview

const attributeMap = new Map([
	['rawFile', {
		title: 'Choose Directory',
		content: /*html*/`
			<div class='form-group'>
				// file-tree
				<label>Select Folder:</label>
				<input data-ref='path-input' type='text' class='form-control'>
				// <p data-ref='available'>Path is not avaiable<p>
				<div data-ref='file-tree'></div>
			</div>
		`
	}],
	['labelTree', {
		title: 'Select Label Tree',
		content: /*html*/`
		`
	}],
	['pipeElement', {
		title: 'Select Pipeline',
		content: /*html*/`
		`
	}],
])

export default class DatasourceStartModal extends BaseModal {
    constructor(node: DatasoureNodePresenter){
		// init modal html
		super(attributeMap.get(node.model.datasource.type))

        // add bindings
        switch(node.model.datasource.type){
            case 'rawFile':
				// map data for bootstrap-tree
				var data = {
					name: "1",
					nodes: [
						{
							name: "1.1",
							nodes: [
								{
									name: "1.1.1",
									nodes: [{
										name: "1.1.1.1"
									}],
								},
								{
									name: "1.1.2"
								},
								{
									name: "3.1.2 - will this be undefined?"
								}
							]
						},
						{
							name: "1.2",
							nodes: [
								{
									name: "1.2.1"
								}
							]
						},
						{
							name: "1.3"
						},
						{
							name: "2.4 - is this undefined?"
						}
					]
				}
				data = mapTree(data, {
					childrenKey: 'nodes',
					map: [['name', 'text']],
				})
				// const data = mapTree(node.model.datasource.fileTree, {
				// 	childrenKey: 'children',
				// 	map: [['name', 'text'], ['children', 'nodes']],
				// 	// filter: (item => item.type === 'directory'),
				// })
				// console.log({data})

				// init bootstrap-tree.
				$(this.html.refs['file-tree']).treeview({ 
					data: data.nodes,
					icon: 'fa folder',
					selectedIcon: 'fa folder-open',
				})
				$(this.html.refs['file-tree']).treeview('collapseAll')

				// set bootstrap-tree event handlers.
				// expand node on select & set data.
				// TODO: should trigger validation request for the node
				$(this.html.refs['file-tree']).on('nodeSelected', ($event, node) => {
					console.log('selected', node)
					if(!node.state.expanded){
						$(this.html.refs['file-tree']).treeview('expandNode', node.nodeId)
					}
					
					let parent = $(this.html.refs['file-tree']).treeview('getParent', node)
					console.log('parent:', parent)
					while(parent.nodeId){
						console.log('parent:', parent)
						parent = $(this.html.refs['file-tree']).treeview('getParent', parent)
					}
				})
				// collapse node on double select (unselect).
				// treeview('getSelected') is broken.
				$(this.html.refs['file-tree']).on('nodeUnselected', ($event, node) => {
					// console.log('2. node selected', node)
					// console.log('selected nodes:', $(this.html.refs['file-tree']).treeview('getSelected'))
					// console.log('expanded nodes:', $(this.html.refs['file-tree']).treeview('getExpanded'))
				})
				// collapse previous folder
				$(this.html.refs['file-tree']).on('nodeUnselected', ($event, node) => {
					// $(this.html.refs['file-tree']).treeview('collapseNode', node.nodeId)
					// const parent = $(this.html.refs['file-tree']).treeview('getParent', node)
					// if(partent && parent.state.expanded)
					// if()
					// const selectedNode = $(this.html.refs['file-tree']).treeview('getSelected', node.nodeId)
					// console.log({selectedNode})
					// console.log('node disabled', node)
					// TODO: should invalidate the node
				})

				// add search bar functionallity
                $(this.html.refs['path-input']).on('input', ($event) => {
                    console.log('searching...')
					// $('#tree').treeview('search', [ 'Parent', {
					// 	ignoreCase: true,     // case insensitive
					// 	exactMatch: false,    // like or equals
					// 	revealResults: true,  // reveal matching nodes
					// }]);
                })

                break
			case 'labelTree':
				throw new Error('Not implemented.')
            case 'pipeElement':
				throw new Error('Not implemented.')
			default:
        }
    }
}