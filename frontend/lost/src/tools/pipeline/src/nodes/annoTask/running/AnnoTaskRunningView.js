import BaseNodeView from '../../BaseNodeView'


export default class AnnoTaskRunningView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-pencil',
				title: 'Annotation Task',
			},
			content: [
				{
					attribute: 'Name',
					value: model.state.name,
					ref: 'name',
				},
				{
					progress: model.progress.value,
					ref: 'progress',
				},
			],
			footer: {
				state: model.state.value,
				text: model.state.value.replace('_', ' '),
			},
		})
    }
}
