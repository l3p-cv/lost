import { NodeTemplate } from "pipRoot/l3pfrontend/index"


export default class ScriptStartView {
    constructor(model) {
        let nodeClass = "success"
        if (model.post.script.arguments === "" || model.post.script.arguments === undefined || model.post.script.arguments === null) {
            nodeClass = "primary"
        } else {
            // for (let element of model.post.script.arguments) {
            //     if (element[Object.keys(element)[0]].value === "" || element[Object.keys(element)[0]].value === undefined) {
            //         validation = "warning"
            //         break
            //     }
            // }
        }
        if(model.post.script.isDebug){
            nodeClass = "danger"
        }

        this.html = new NodeTemplate(`
            <div class="panel panel-${nodeClass} 
            custom_node">
            <div class="panel-heading ">
            <i class="fa fa-rocket fa-2x pull-left" aria-hidden="true"></i>
            <h class="panel-title">Script</h>
            </div>
            <div class="panel-body">
            <table class="table table-borderless">
            <tbody>
            <tr><td>Name:</td><td>${model.script.name}</td></tr>
            <tr>
            <td>
            Debug:
            </td>
            <td>
            <input data-ref="checkbox"  type="checkbox" ${model.post.script.isDebug ? `checked`: ``}>
            </td>
            </tr>
            </tbody>  
            </table>
            </div>
            </div>
            
        `)

        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }

}

//