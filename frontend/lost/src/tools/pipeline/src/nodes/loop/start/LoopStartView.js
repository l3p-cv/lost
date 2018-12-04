import BaseNodeView from '../../BaseNodeView'


export default class LoopStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-refresh',
				title: 'Loop',
			},
			content: [
				{
					attribute: 'Max Iterations',
					value: model.loop.max_iteration,
				},
			],
		})
    }
}