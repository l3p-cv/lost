import { NodeTemplate } from 'pipRoot/l3pfrontend/index'
import appModel from 'start/appModel'


export default class DatasourceStartView {
    constructor(model) {
        let validation = true
        switch (model.datasource.type) {
            case 'rawFile':
                if (model.post.datasource.rawFilePath === undefined || model.post.datasource.rawFilePath === '') {
                    validation = false
                }
                break
            case 'pipeElement':
                if (isNaN(model.post.datasource.pipeElementId)) {
                    validation = false
                }
                break
            default:
                throw new Error('invalid datasourcce type.')
        }

        model.validation = validation
        appModel.state.checkNodesValidation.update(true)

        this.html = new NodeTemplate(/*html*/`
            <div class='card pipeline-graph-node ${validation ? `success` : `warning`}'>
                <div class='card-header'>
					// <div class='col'>
						<i class='fa fa-hdd-o'></i>
						<span class='node-title'>Datasource</span>
					// </div>
                </div>
                <div class='card-body'>
					<div class=''>
						<table class='table table-borderless'>
								<tr><td>Type:</td><td>${model.datasource.type}</td></tr> 
						</table>
					</div>
                </div>
            </div>
        `)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }
    setDropdownValue(text: string) {
        $(this.parentNode).find(`[data-ref='dropdown']`)[0].textContent = text
    }
}