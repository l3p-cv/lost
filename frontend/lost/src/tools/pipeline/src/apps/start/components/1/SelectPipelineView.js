import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import './SelectPipeline.scss'


class SelectPipelineView extends WizardTabView {
    constructor(){
        super({
            title: 'Choose a Template',
            icon: 'fa fa-puzzle-piece fa-1x',
            content: /*html*/`
                <table data-ref="data-table" class='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Author</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                </table>
            `,
        })
        this.table = $(this.html.refs["data-table"]).DataTable({
            paging: false,
            scrollX: true,
            order: [[ 4, 'asc' ]],         
            columnDefs:[{
                targets: [0],
                visible: false,
            }],
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