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
					value: model.annoTask.name,
					ref: 'name',
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
