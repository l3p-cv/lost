import { NodeTemplate } from "l3p-frontend"


export default class DataExportStartView {
    constructor(model) {
        this.html = new NodeTemplate(`
            <div class="panel panel-primary custom_node">
                <div class="panel-heading ">
                    <i class="fa fa-cloud-download fa-2x pull-left" aria-hidden="true"></i>
                    <h class="panel-title">Data Export</h>
                </div>
                <div class="panel-body">
                    <i  class="fa fa-cloud-download fa-5x color-grey" aria-hidden="true"></i>
                </div>
            </div>
        `)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
}