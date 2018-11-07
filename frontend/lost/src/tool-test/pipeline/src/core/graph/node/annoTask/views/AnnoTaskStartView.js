import { NodeTemplate } from "l3p-core"
import appModel from "../../../../../apps/start/appModel"
export default class AnnoTaskStartView {
    constructor(model) {
        let validation = false
        if( model.post.annoTask.instructions != "" &&
            model.post.annoTask.name != "" &&
            model.post.annoTask.labelLeaves.length > 0 &&
            model.post.annoTask.workerId != undefined
          ){
              validation = true
          }
          model.validation = validation
          appModel.state.checkNodesValidation.update(true)
        this.html = new NodeTemplate(`
            <div class="panel panel-${validation ? `success`:`warning`} custom_node">
                <div class="panel-heading ">
                    <i class="fa fa-pencil fa-2x pull-left" ></i>                
                    <h class="panel-title">Annotation Task</h>           
                </div>
                <div class="panel-body">
                    <table class="table table-borderless">
                        <tbody>
                        <tr><td>Name:</td><td>${model.post.annoTask.name}</td></tr> 
                        <tr><td>Assignee:</td><td>${model.meta.assignee}</td></tr>       
                        </tbody>  
                    </table>
                    ${model.meta.labelLeaves.map(element => `
                    <span class="annotask-span-node-default bg-blue">${element.name}</span> &nbsp;&nbsp;&nbsp;
                    `).join("")}
                </div>
            </div>
        `)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
    setName(name: String) {
        $(this.parentNode).find("[data-ref='name']").text(name)
    }

}



{
    /* <p> Assignee:  
    <span data-ref="assignee">
    ${model.annoTask.availableUser.map(element => 
    (element.id == model.post.annoTask.workerId) ?
    ` ${element.name}`
    :``
    ).join("")}
    </span> <p> */
}