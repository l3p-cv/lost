import BaseNodeView from '../../BaseNodeView'


export default class ScriptRunningView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-rocket',
				title: 'Script',
			},
			content: [
				{
					attribute: 'Name',
					value: model.script.name,
				},
			],
			footer: {
				state: model.state.value,
				text: model.state.value.replace('_', ' '),
			},
		})
	}
}
