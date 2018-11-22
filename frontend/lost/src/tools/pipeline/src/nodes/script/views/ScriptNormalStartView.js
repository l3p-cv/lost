import { NodeTemplate } from 'pipRoot/l3pfrontend/index'


export default class ScriptStartView {
    constructor(model) {
        let validation = true
        this.html = new NodeTemplate(/*html*/`
			<div class='panel'>
				<div class='panel-heading bg-${!model.post.script.arguments ? `primary` : validation ? `success` : `warning`}'>
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
				</div>
			</div>
		`)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // all view events will be delegated to the parent node.
        this.parentNode = undefined
    }

}