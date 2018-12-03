import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class DatasourceNodeModel extends BaseNodeModel {
    constructor(params: any, mode: String) {
		const { peN, peOut, id, state, datasource } = params	
	
		super({ peN, peOut, mode })
	
		// { type: String, fileTree: any }
		this.datasource = datasource

        if(mode === 'start'){
            this.state = {
				path: new Observable(''),
			}
        }
		
		if(mode === 'running'){
            this.id = id
			// for progress bar updates
            this.state = new Observable(state)
        }
    }
	isValidated(){
		// no real validation atm.
		return !this.state.path.isInInitialState
	}
	getOutput(){
		return {
			peN: this.peN,
			path: this.state.path.value,
		}
	}
}
