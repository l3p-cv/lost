import BaseNodeView from '../../BaseNodeView'


export default class ScriptRunningView extends BaseNodeView {
    constructor(model: ScriptRunningModel) {
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
				{
					progress: model.progress.value,
				},
			],
			footer: {
				status: model.status.value,
				text: model.status.value.replace('_', ' '),
			},
		})
	}
}
