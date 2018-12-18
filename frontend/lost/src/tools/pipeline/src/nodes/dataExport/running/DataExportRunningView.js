import BaseNodeView from '../../BaseNodeView'


export default class AnnoTaskRunningView extends BaseNodeView {
    constructor(model: DataExportRunningModel) {
		super({
			header: {
				icon: 'fa fa-cloud-download',
				title: 'Data Export',
			},
			content: { icon: 'fa fa-cloud-download' },
			footer: {
				status: model.status.value,
				text: model.status.value.replace('_', ' '),
			},
		})
    }
}
