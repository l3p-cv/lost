import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class DataExportRunningModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, dataExport } = params	
		
		super({ peN, peOut, mode })

		this.id = id
		
		this.dataExport = dataExport

		// for progress bar updates
		this.state = new Observable(state)
    }
}