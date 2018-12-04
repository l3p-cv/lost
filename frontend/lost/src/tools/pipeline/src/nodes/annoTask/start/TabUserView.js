import { WizardTabView } from 'l3p-frontend'
import './TabUserStyle.scss'


export default class TabUserView extends WizardTabView {
    constructor(groups: any){
        super({
			title: 'Select User or Group',
            icon: 'fa fa-user fa-1x',
            content: /*html*/`
                <div class='container-fluid'>            
                    <table data-ref='data-table' class='table table-striped table-bordered'>
						<thead>
							<tr>
								<th>ID</th>								
								<th>Name</th>								
								<th>Icon</th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
                </div>
            `,
        })
		this.table = $(this.html.refs["data-table"]).DataTable({
			data: groups,
            paging: false,
            scrollX: true,
            order: [[ 2, 'asc' ]],      // order by name   
        })
    }
	adjustDataTable(){
		this.table.columns.adjust()
	}
	selectRow(row: HTMLTableRowElement){
		row.classList.toggle('selected', true)
	}
}