import BaseNodeView from '../../BaseNodeView'


export default class LoopRunningView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-refresh',
				title: 'Loop',
			},
			content: [
				{
					attribute: 'Max Iterations',
					value: model.loop.max_iteration ? model.loop.max_iteration : Number.POSITIVE_INFINITY,
				},
				{
					icon: 'fa fa-refresh',
				},
			],
			footer: {
				state: model.status.value,
				text: model.status.value.replace('_', ' '),
			},
		})
    }
}
