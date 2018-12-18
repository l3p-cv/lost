import BaseNodeView from '../../BaseNodeView'


export default class DatasourceRunningView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-hdd-o',
				title: 'Datasource',
			},
			content: [
				{
					attribute: 'Type',
					value: model.datasource.type,
				},
			],
			footer: {
				status: model.status.value,
				text: model.status.value.replace('_', ' '),
			},
		})
    }
}

