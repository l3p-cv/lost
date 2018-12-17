import BaseNodeView from '../../BaseNodeView'


export default class DatasourceStartView extends BaseNodeView {
    constructor() {
		super({
			header: {
				icon: 'fa fa-cloud-download',
				title: 'Data Export',
			},
			content: { icon: 'fa fa-cloud-download' },
		})
    }
}