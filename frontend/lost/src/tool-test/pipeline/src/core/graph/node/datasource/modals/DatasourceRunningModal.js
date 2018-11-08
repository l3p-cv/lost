import BaseModal from "../../BaseModal"


export default class DatasourceRunningModal extends BaseModal {
    constructor(nodeModel){
        let params = {}
        switch(nodeModel.datasource.type){
        case "dataset":
            params = {
                title: "Datasource",
                content: `
                    <table class="table table-hover">
                        <tr><td><strong>Type:</td><td>Dataset</td></tr> 
                        <tr><td><strong>Dataset ID: </td><td>${nodeModel.datasource.dataset.id}</td></tr>                
                        <tr><td><strong>Name: </td><td>${nodeModel.datasource.dataset.name}</td></tr>
                        <tr><td><strong>Description: </td><td>${nodeModel.datasource.dataset.description}</td></tr>                
                    </table>
                `   
            }
            break
        case "modelLeaf":
            params = {
                title: "Datasource",
                content: `
                    <table class="table table-hover">
                        <tr><td><strong>Type:</td><td>Model Leaf</td></tr>
                        <tr><td><strong>Model Leaf ID: </td><td>${nodeModel.datasource.modelLeaf.id}</td></tr>  
                        <tr><td><strong>Name: </td><td>${nodeModel.datasource.modelLeaf.name}</td></tr>
                        <tr><td><strong>Description: </td><td>${nodeModel.datasource.modelLeaf.description}</td></tr>
                        <tr><td><strong>Architecture: </td><td>${nodeModel.datasource.modelLeaf.architecture}</td></tr>   
                        <tr><td><strong>Framework: </td><td>${nodeModel.datasource.modelLeaf.framework}</td></tr>   
                        <tr><td><strong>ModelTreeName: </td><td>${nodeModel.datasource.modelLeaf.modelTreeName}</td></tr>
                        <tr><td><strong>ParentId: </td><td>${nodeModel.datasource.modelLeaf.parentId}</td></tr>                                                
                    </table>
                `   
            }
            break
        case "pipeElement":
            params = {
                title: "Datasource",
                content: `
                    <table class="table table-hover">
                        <tr><td><strong>Type:</td><td>Pipe Element</td></tr> 
                        <tr><td><strong>Pipe Element ID: </td><td>${nodeModel.datasource.pipeElement.id}</td></tr> 
                    </table>
                `   
            }
            break
        case "rawFile":
             params = {
                title: "Datasource",
                content: `
                    <table class="table table-hover">
                        <tr><td><strong>Type:</td><td>Raw File</td></tr> 
                        <tr><td><strong>Path: </td><td>${nodeModel.datasource.rawFilePath}</td></tr>
                    </table>

                    <a class="cursor-pointer" data-ref="more-information-link"> 
                    <u>More informations </u> &nbsp;<i data-ref="more-information-icon" class="fa fa-chevron-down " aria-hidden="true"></i></a>
                    
                    <div class="panel-group">
                        <div class="panel panel-primary no-border">      
                            <div data-ref="collapse-this" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <table class="table table-hover">
                                        <tbody>
                                            <tr><td><strong>Element ID: </td><td>${nodeModel.id}</td></tr>                
                                            <tr><td><strong>Pipe Element ID: </td><td>${nodeModel.datasource.id}</td></tr>
                                            <tr>
                                                <td><strong>State: </strong></td>
                                                <td data-ref="state" class="word-break">${nodeModel.state.value.replace("_", " ")}</td>
                                            </tr>                            
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `   
            }
            break
        }
        
        super(params)
    }
}