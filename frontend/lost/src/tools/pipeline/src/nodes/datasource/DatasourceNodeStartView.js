import BaseNodeView from '../BaseNodeView'


export default class DatasourceStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-hdd-o',
				title: 'Datasource',
				colorInvalidated: 'warning',
				colorValidated: 'success',
			},
			content: [
				{
					attribute: 'Type',
					value: model.datasource.type,
				},
				{
					attribute: 'Source',
					value: model.state.path.value,
					ref: 'source',
				},
			],
		})
		console.log(this)
    }
	setSource(source: String){
		this.html.refs['source'].textContent = source
	}
	
}