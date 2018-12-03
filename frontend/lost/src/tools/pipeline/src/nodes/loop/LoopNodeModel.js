import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class LoopNodeModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, loop } = params

		super({ peN, peOut, mode })

		this.id = id
		// data structure?
		this.loop = loop

		if(mode === 'running'){
			// for progress bar updates
            this.state = new Observable(state)
        }
    }
}