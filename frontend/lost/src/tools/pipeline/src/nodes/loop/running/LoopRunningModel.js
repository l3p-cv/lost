import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class LoopRunningModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, id, state, loop } = params

		super({ peN, peOut, id, loop })

		// for progress bar updates
		this.status = new Observable(state)
    }
}