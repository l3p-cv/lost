import { NodeTemplate } from 'pipRoot/l3pfrontend/index'


export default class ScriptRunningView {
    constructor(model) {
        this.html = new NodeTemplate(/*html*/`        
            <div class='panel panel-primary custom-node' data-toggle='tooltip' data-placement='right' title='<h4>Description</h4><p>${model.script.description}<p>'>
                <div class='panel-heading '>
                    <i class='fa fa-rocket fa-2x pull-left'></i>
                    <h class='panel-title'>Script</h>
                </div>
                <div class='panel-body'>
                    <table class='table table-borderless'>
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>${model.script.name}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class='progress progessbar-nodes'>
                        <div data-ref='progress-bar' class='progress-bar' role='progressbar'
                            style='width:${model.progress.value }%'>
                            <p data-ref='progress-bar-text' class='color-black'>${model.progress.value ?model.progress.value: 0}%<p>
                        </div>
                    </div>
                </div>
                <div data-ref='state' class='panel-footer 
                    ${ model.state.value === 'script_error'   ? 'bg-red'      : '' }
                    ${ model.state.value === 'pending'        ? 'bg-blue'     : '' }
                    ${ model.state.value === 'in_progress'    ? 'bg-orange'   : '' }
                    ${ model.state.value === 'finished'       ? 'bg-green'    : '' } 
                    '>
                    <p2 data-ref='state-text' class='color-white footer-text'>${model.state.value.replace('_', ' ')}</p2>
                </div>
            </div>
        `)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
}
