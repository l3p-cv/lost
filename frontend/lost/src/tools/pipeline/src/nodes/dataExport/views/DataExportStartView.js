import BaseNodeView from '../../BaseNodeView'


export default class DatasourceStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-cloud-download',
				title: 'Data Export',
				// colorInvalidated: 'warning',
				// colorValidated: 'success',
			},
			content: [ `<i class='fa fa-cloud-download'></i>` ],
		})
    }
}