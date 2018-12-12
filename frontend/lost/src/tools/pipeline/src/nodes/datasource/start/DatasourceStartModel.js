import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DatasourceStartModel extends BaseNodeModel {
    constructor(params: any) {
		const { peN, peOut, datasource } = params	
	
		super({ peN, peOut })
	
		// { type: String, fileTree: any }
		this.datasource = datasource

		this.state = {
			path: new Observable(''),
		}
    }
	isValidated(){
		return !(this.state.path.isInInitialState) && (this.state.path.value.length > 0)
	}
	getOutput(){
		return {
			peN: this.peN,
			path: this.state.path.value,
		}
	}
}
