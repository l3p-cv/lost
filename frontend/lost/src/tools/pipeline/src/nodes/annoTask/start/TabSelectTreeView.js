import { WizardTabView } from 'pipRoot/l3pfrontend/index'


export default class TabSelectTreeView extends WizardTabView {
    constructor(model) {
        super({
            title: 'Select Label Tree',
            icon: 'fa fa-database fa-1x',
            content: /*html*/`
				<table data-ref="data-table" class='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                </table>
            `,
        })
		this.table = $(this.html.refs["data-table"]).DataTable({
            paging: false,
            scrollX: true,
            order: [[ 3, 'asc' ]],         
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
    }
	adjustDataTable(){
		this.table.columns.adjust()
	}

}