import BaseNodeView from '../../BaseNodeView'


export default class AnnoTaskRunningView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-cloud-download',
				title: 'Data Export',
			},
			content: { icon: 'fa fa-cloud-download' },
			footer: {
				state: model.state.value,
				text: model.state.value.replace('_', ' '),
			},
		})
    }
}
