import { NodeTemplate } from "l3p-core"
import "../../base-node.style.scss"

export default class DataExportRunningView {
    constructor(model) {
        this.html = new NodeTemplate(`
            <div class="panel panel-primary custom_node">
                <div class="panel-heading ">
                    <i class="fa fa-cloud-download fa-2x pull-left" aria-hidden="true"></i>
                    <h class="panel-title">Data Export</h>
                </div>
                <div class="panel-body">
                    <i class="fa fa-cloud-download fa-5x color-grey" aria-hidden="true"></i>
                </div>
                <div data-ref="state" class="panel-footer 
                        ${ model.state.value == "script_error"   ? "bg-red "      : " " }
                        ${ model.state.value == "pending"        ? "bg-blue "     : " " }
                        ${ model.state.value == "in_progress"    ? "bg-orange "   : " " }
                        ${ model.state.value == "finished"       ? "bg-green "    : " " } 
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
