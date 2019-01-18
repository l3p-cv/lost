import { BaseModal } from 'l3p-frontend'


export default class AnnoTaskRunningModal extends BaseModal {
    constructor(nodeModel: AnnoTaskRunningModel){
		const { annoTask, progress, status } = nodeModel
        super({
            title: 'Annonation Task',
            content: /*html*/`
                <table class='table table-hover'>
                    <tr><td><strong>Annotation Task Name: </td><td>${annoTask.name}</td></tr>     
                    <tr><td><strong>Instructions: </td><td>${annoTask.instructions}</td></tr>    
                    <tr><td><strong>User Name: </td><td>${annoTask.userName}</td></tr>                            
                </table>

                <div class='container'>
                    <div class='progress'>
                        <div data-ref='progress-bar' class='progress-bar' role='progressbar' 
                            style='width:${progress.value}%'>
                            <p data-ref='progress-bar-text' class='color-black'>
                            	${progress.value}%
                            </p>
                        </div>
                    </div>
                </div>

                <a class='cursor-pointer' data-ref='more-information-link'> 
                    <u>More information</u>
                    <i data-ref='more-information-icon' class='fa fa-chevron-down'></i>
                </a>

                <div class='panel-group'>
                    <div class='panel panel-primary no-border'>      
                        <div data-ref='collapse-this' class='panel-collapse collapse'>

                        <div class='panel-body'>
                            <table class='table table-hover'>
                                <tbody>
                                    <tr><td><strong>Element ID: </td><td>${nodeModel.id}</td></tr>                
                                    <tr><td><strong>Annotation Task ID: </td><td>${annoTask.id}</td></tr>     
                                    <tr><td><strong>Configurations: </td><td>${annoTask.configurations}</td></tr>  
                                    <tr><td><strong>Type: </td><td>${annoTask.type}</td></tr>    
                                    <tr>
                                        <td><strong>Status: </strong></td>
                                        <td data-ref='status' class='word-break'>${status.value.replace('_', ' ')}</td>
                                    </tr>                          
                                </tbody>
                            </table>
                        </div>

                        <h4>Required Categories:</h4>
                            <div>
                                ${annoTask.labelLeaves.map(element => `
                                    <span class='label label-info required-categories-label'>${element.name}</span>
                                `)}
                            </div>
                        </div>
                        
                    </div>
                </div>
            `   
        })
    }
}