import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class VisualOutputNodeModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, visualOutput } = params

		super({ peN, peOut, mode })

        if(mode === 'start'){
			// what is this?
            this.visualOutput = ''
        }

		if(mode === 'running'){
            this.id = id
			// what is this?
            this.visualOutput = visualOutput
			// for progress bar updates
            this.state = new Observable(state)
        }
    }
}