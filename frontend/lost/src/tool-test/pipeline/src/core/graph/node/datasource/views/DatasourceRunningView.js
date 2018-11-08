import { NodeTemplate } from "l3p-core"
import "../../base-node.style.scss"

import "bootstrap"
import "bootstrap"


export default class DatasourceRunningView {
    constructor(model) {
        this.html = new NodeTemplate(`
        <div class="panel panel-primary custom_node">
            <div class="panel-heading ">
                <i class="fa fa-hdd-o fa-2x pull-left" aria-hidden="true"></i>
                <h class="panel-title">Datasource</h>
            </div>
            <div class="panel-body">
                <table class="table table-borderless">
                    <tbody>
                        <tr>
                            <td>Type:</td>
                            <td>${model.datasource.type}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div data-ref="state" class="panel-footer 
                    ${ model.state.value === "script_error"   ? "bg-red"      : "" }
                    ${ model.state.value === "pending"        ? "bg-blue"     : "" }
                    ${ model.state.value === "in_progress"    ? "bg-orange"   : "" }
                    ${ model.state.value === "finished"       ? "bg-green"    : "" } 
                    ">
                    <p2 data-ref="state-text" class="color-white footer-text">${model.state.value.replace("_", " ")}</p2>
                </div>
        </div>`)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
}
