import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DatasourceStartModel extends BaseNodeModel {
    constructor(params: any, mode: String) {
		const { peN, peOut, id, state, datasource } = params	
	
		super({ peN, peOut, mode })
	
		// { type: String, fileTree: any }
		this.datasource = datasource

		this.state = {
			path: new Observable(''),
		}
    }
	isValidated(){
		// any side effects possible?
		return !this.state.path.isInInitialState
	}
	getOutput(){
		return {
			peN: this.peN,
			path: this.state.path.value,
		}
	}
}
