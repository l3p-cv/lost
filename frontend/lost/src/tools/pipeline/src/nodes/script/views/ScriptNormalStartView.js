import BaseNodeView from '../../BaseNodeView'


export default class ScriptStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-rocket',
				title: 'Script',
				colorInvalidated: model.post.script.arguments ? 'warning' : 'primary',
				colorValidated: model.post.script.arguments ? 'success' : 'primary',
			},
			content: [
				{
					attribute: 'Name',
					value: model.script.name,
				},
			],
		})
		// ------ ???
        let validation = true
		// ------ ???
	}
}