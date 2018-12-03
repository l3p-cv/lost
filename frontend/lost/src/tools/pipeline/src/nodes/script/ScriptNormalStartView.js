import BaseNodeView from '../BaseNodeView'


export default class ScriptStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-rocket',
				title: 'Script',
				colorInvalidated: model.script.arguments ? 'warning' : 'primary',
				colorValidated: model.script.arguments ? 'success' : 'primary',
			},
			content: [
				{
					attribute: 'Name',
					value: model.script.name,
				},
			],
		})
	}
}