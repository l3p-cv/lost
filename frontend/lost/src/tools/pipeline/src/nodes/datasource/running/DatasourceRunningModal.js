import { BaseModal } from 'l3p-frontend'


export default class DatasourceRunningModal extends BaseModal {
    constructor(nodeModel: DatasourceNodeModel){
		const { id, status, datasource } = nodeModel
        super({
			title: 'Datasource',
			content: /*html*/`
				<table class='table table-hover'>
					<tr><td><strong>Type:</td><td>Raw File</td></tr> 
					<tr><td><strong>Path: </td><td>${datasource.rawFilePath}</td></tr>
				</table>

				<a class='cursor-pointer' data-ref='more-information-link'> 
				<u>More information </u> &nbsp;<i data-ref='more-information-icon' class='fa fa-chevron-down '></i></a>
				
				<div class='panel-group'>
					<div class='panel panel-primary no-border'>      
						<div data-ref='collapse-this' class='panel-collapse collapse'>
							<div class='panel-body'>
								<table class='table table-hover'>
									<tbody>
										<tr><td><strong>Element ID: </td><td>${id}</td></tr>                
										<tr><td><strong>Pipe Element ID: </td><td>${datasource.id}</td></tr>
										<tr>
											<td><strong>Status: </strong></td>
											<td data-ref='status' class='word-break'>${status.value.replace('_', ' ')}</td>
										</tr>                            
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			`   
            })
    }
}