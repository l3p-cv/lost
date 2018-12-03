import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class DataExportNodeModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, dataExport } = params	
		
		super({ peN, peOut })

        if(mode === 'start'){
            this.dataExport = ''
        }

		if(mode === 'running'){
            this.id = id
            this.dataExport = dataExport
			// for progress bar updates
            this.state = new Observable(state)
        }
    }
}