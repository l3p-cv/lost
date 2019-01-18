import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DatasourceStartModel extends BaseNodeModel {
    constructor(params: any) {
		super(params)
		this.state = {
			path: new Observable(''),
		}
    }
	isValidated(){
		return !(this.state.path.isInInitialState) && (this.state.path.value.length > 0)
	}
	getOutput(){
		const { peN } = this
		let { datasource } = this
		datasource = Object.assign({}, datasource, { 
			rawFilePath: this.state.path.value,
		})
		return {
			datasource,
			peN,
		}
	}
}
