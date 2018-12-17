import BaseNodeView from '../../BaseNodeView'


export default class VisualOutputRunningView extends BaseNodeView {
    constructor(model: VisualOutputRunningModel) {
		super({
			header: {
				icon: 'fa fa-bar-chart',
				title: 'Visualization',
			},
			content: { icon: 'fa fa-bar-chart' },
			footer: {
				state: model.status.value,
				text: model.status.value.replace('_', ' '),
			},
		})
    }
}
