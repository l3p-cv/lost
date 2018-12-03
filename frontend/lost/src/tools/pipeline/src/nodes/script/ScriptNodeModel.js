import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class ScriptNodeModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, script } = params

		super({ peN, peOut, mode })
		
        this.id = id

		// data structure?
        this.script = script
        
        if(mode === 'running'){
			// for progress bar updates
            this.state = new Observable(state)
            this.progress = new Observable(script.progress ? script.progress : 0)
            this.errorMsg = new Observable(script.errorMsg ? script.errorMsg : '')
        }
    }
	getOutput(){
		return {
			peN: this.peN,
			script: {
				arguments: this.script.arguments
			}
		}
	}
}