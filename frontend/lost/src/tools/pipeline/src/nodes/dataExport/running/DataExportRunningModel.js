import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DataExportRunningModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, id, state, dataExport } = params	
		
		super({ peN, peOut, id, dataExport })

		// for progress bar updates
		this.status = new Observable(state)
    }
}