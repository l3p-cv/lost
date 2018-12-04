import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DatasourceRunningModel extends BaseNodeModel {
    constructor(params: any, mode: String) {
		const { peN, peOut, id, state, datasource } = params	
	
		super({ peN, peOut, mode })
	
		// { type: String, fileTree: any }
		this.datasource = datasource

		this.id = id
		// for progress bar updates
		this.state = new Observable(state)
    }
}
