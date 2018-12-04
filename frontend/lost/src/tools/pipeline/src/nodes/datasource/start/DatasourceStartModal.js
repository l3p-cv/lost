import { BaseModal, mapTree, keyboard } from 'l3p-frontend'

// bootstrap-tree does only support glyphicons as it seems.
// expanding and collapsing do not work per default.
// options to fix not having glyphicons: 
// - buy glyphicons (-)
// - fork bootstrap-tree and fix / extend it (--)
// - build a tree component in our framework (+)
// - build a tree component in react (++)
// - replace component with good premade react component (++)
import 'bootstrap-tree'
import 'bootstrap-tree/dist/bootstrap-treeview.min.css'
// https://github.com/jonmiles/bootstrap-treeview

const attributeMap = new Map([
	['rawFile', {
		title: 'Choose Directory',
		content: /*html*/`
			<div class='form-group' data-ref='raw-file-root'>
				<label>Select Folder:</label>
				<input data-ref='search-bar' type='text' class='form-control'>
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
    constructor(nodeModel: DatasourceNodeModel){
		// init modal html
		super(attributeMap.get(nodeModel.datasource.type))

        // add bindings
        switch(nodeModel.datasource.type){
            case 'rawFile':
				// map data for bootstrap-tree
				// ---------------------------------------------------------------------------------------------------------------
				const data = mapTree(nodeModel.datasource.fileTree, {
					childrenKey: 'children',
					map: [['name', 'text'], ['children', 'nodes']],
					filter: (item => item.type === 'directory'),
				})
				// console.log({data})

				// init bootstrap-tree.
				// ---------------------------------------------------------------------------------------------------------------
				$(this.html.refs['file-tree']).treeview({ 
					data: data.nodes,
					icon: 'fa folder',
					selectedIcon: 'fa folder-open',
				})
				$(this.html.refs['file-tree']).treeview('collapseAll')

				// set bootstrap-tree event handlers.
				// TODO: add arrow key movement.
				// TODO: should trigger validation request for the node.
				// TODO: replace enter with tab key for cycling through multiple search results.
				// ---------------------------------------------------------------------------------------------------------------
				// expand node on select & set data.
				$(this.html.refs['file-tree']).on('nodeSelected', ($event, node) => {
					if(!node.state.expanded){
						$(this.html.refs['file-tree']).treeview('expandNode', node.nodeId)
					}
				})

				// add search bar functionallity.
				let searchResultCycleIndex = 0
				let searchResults = undefined
                $(this.html.refs['search-bar']).on('input', ($event) => {
					searchResults = $(this.html.refs['file-tree']).treeview('search', [ $event.target.value, {
						ignoreCase: true,
						exactMatch: false,
						revealResults: true,
					}])
                })
                $(this.html.refs['search-bar']).on('keyup', ($event) => {
					if(keyboard.isKeyHit($event, 'Enter')){
						// one search match
						if(searchResults.length === 1){
							$(this.html.refs['file-tree']).treeview('clearSearch')
							$(this.html.refs['file-tree']).treeview('selectNode', searchResults[0].nodeId)
							searchResultCycleIndex = 0
							// set focus on ok button
							$(this.html.refs['ok-button']).focus()
						}
						// multiple search matches
						if(searchResults.length > 1){
							$(this.html.refs['file-tree']).treeview('selectNode', searchResults[searchResultCycleIndex].nodeId)
							searchResultCycleIndex = (searchResultCycleIndex === searchResults.length - 1)
								? 0
								: searchResultCycleIndex + 1
						}
					}
				})

				// finish search.
				$(this.html.refs['file-tree']).on('click', 'li', $event => {
					const selectedNode = $(this.html.refs['file-tree']).treeview('getNode', $event.currentTarget.dataset['nodeid'])
					searchResults = $(this.html.refs['file-tree']).treeview('search', [ selectedNode.text, {
						ignoreCase: true,
						exactMatch: true,
						revealResults: true,
					}])
					if(selectedNode.state.selected){
						// need to stop propagation or bootstrap-tree will unselect it.
						$event.stopPropagation()
						$(this.html.refs['file-tree']).treeview('clearSearch')
					}
				})

				// focus searchbar when modal opens.
				$(this.html.root).on('shown.bs.modal',() => {
					if(this.html.refs['search-bar']){
						this.html.refs['search-bar'].focus()
					}
				})

				// when button has focus focus search bar on backspace key. 
				// notice: escape key wont trigger, prevented by bootstrap-tree.
				$(this.html.refs['ok-button']).on('keyup', $event => {
					if(keyboard.isKeyHit($event, 'Backspace')){
						$(this.html.refs['search-bar']).focus()
					}
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