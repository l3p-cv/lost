import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DatasourceRunningModel extends BaseNodeModel {
    constructor(params: any) {
		const { peN, peOut, id, state, datasource } = params	
	
		super({ peN, peOut, id, datasource })
	
		// for progress bar updates
		this.status = new Observable(state)
    }
}
