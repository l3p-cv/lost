import { BaseModal } from 'pipRoot/l3pfrontend/index'

import 'bootstrap-tree'
import 'bootstrap-tree/dist/bootstrap-treeview.min.css'

const attributeMap = new Map([
	['rawFile', {
		title: 'Choose Directory',
		content: /*html*/`
			<div class='form-group'>
				<p data-ref='available'>Path is not avaiable<p>
				<label>Search in Path:</label>
				<input data-ref='path-input' type='text' class='form-control'>
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
                $(this.html.refs['path-input']).on('input', ($event) => {
                    for(let path of node.model.datasource.fileTree){
                        if(path === $($event.currentTarget).val()){
                            $(this.html.refs['available']).text('Path is avaiable')                            
                            node.model.state.path.update(path)
                            node.model.state.validated.update(true)
                            break
                        } else {
                            $(this.html.refs['available']).text('Path is not avaiable')
                            node.model.state.path.update('') // reset?
							node.model.state.validated.update(false)
                        }
                    }
                })
				// file tree
				$(this.html.refs['file-tree']).treeview({
					data: node.model.datasource.fileTree.nodes,
				})
				$(this.html.refs['file-tree']).treeview('collapseAll')
				$(this.html.refs['file-tree']).on('nodeSelected', ($event, data) => {
					$(this.html.refs['file-tree']).treeview('expandNode', data.nodeId)
					console.log("node selected", data)
				})
				$(this.html.refs['file-tree']).on('nodeSelected', ($event, data) => {
					console.log("node disabled", data)
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