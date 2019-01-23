import { WizardTabView } from 'l3p-frontend'

import './SelectPipeline.scss'


class SelectPipelineView extends WizardTabView {
    constructor(){
        super({
            title: 'Running Pipelines',
            icon: 'fa fa-puzzle-piece fa-1x',
            content: /*html*/`
				<p>Use right mouse click to open a context menu for each row.</p>
                <table data-ref="data-table" class='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Template Name</th>
                            <th>Author</th>
                            <th>Progress</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                </table>
            `,
        })
        this.table = $(this.html.refs["data-table"]).DataTable({
            paging: false,
            scrollX: true,
            order: [[ 6, 'desc' ]],                         
			columnDefs: [
				{
					targets: [0],
					visible: false,
				},
				{
					targets:[5],
					type: 'date',
				}
			],
        })
    }
    updateTable(data){
        this.table.clear()
        this.table.rows.add(data)
        this.table.draw()
		this.adjustDataTable()
    }
	adjustDataTable(){
		this.table.columns.adjust()
	}
}
export default new SelectPipelineView()
