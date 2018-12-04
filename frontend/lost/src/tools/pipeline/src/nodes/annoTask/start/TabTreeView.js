import { WizardTabView } from 'l3p-frontend'

import "./TabTreeStyle.scss"

// for more information about bootstrap-tree usage see import comments in DatasourceStartModal.js
import 'bootstrap-tree'
import 'bootstrap-tree/dist/bootstrap-treeview.min.css'


export default class TabTreeView extends WizardTabView {
    constructor(){
        super({
            title: 'Select Labels',
            icon: 'fa fa-tag fa-1x',
            content: /*html*/`
                <div class='form-group' data-ref='raw-file-root'>
				<label>Select Folder:</label>
				<input data-ref='search-bar' type='text' class='form-control'>
				<div data-ref='file-tree'></div>
			</div>
            `,
        })
    }
	isInitialized(){
		return this.html.refs['file-tree'].childNodes.length > 0
	}
	update(data){
		if(this.isInitialized()){
			$(this.html.refs['file-tree']).treeview('remove') 
		}
		$(this.html.refs['file-tree']).treeview({ 
			data,
			icon: 'fa folder',
			selectedIcon: 'fa folder-open',
		})
		$(this.html.refs['file-tree']).treeview('collapseAll')
		
		// expand node on select & set data.
		$(this.html.refs['file-tree']).on('nodeSelected', ($event, node) => {
			if(!node.state.expanded){
				$(this.html.refs['file-tree']).treeview('expandNode', node.nodeId)
			}
		})
	}
}
