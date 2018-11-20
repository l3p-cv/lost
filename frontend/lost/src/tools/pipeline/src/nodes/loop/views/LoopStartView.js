import { NodeTemplate } from 'pipRoot/l3pfrontend/index'


export default class LoopStartView {
    constructor(model) {
        this.html = new NodeTemplate(/*html*/`            
            <div class='panel panel-primary custom_node'>
                <div class='panel-heading '>
                    <i class='fa fa-refresh fa-2x pull-left'></i>
                    <h class='panel-title'>Loop</h>
                </div>
                <div class='panel-body'>
                    <table class='table table-borderless'>
                        <tbody>
                            <tr>
                                <td>Max Iterations:</td>
                                <td data-ref='max-iteration'>${model.loop.maxIteration}</td>
                            </tr>
                        </tbody>
                    </table>
                    <i style='color:grey;' class='fa fa-refresh fa-5x'></i>
                </div>
            </div>`)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
}