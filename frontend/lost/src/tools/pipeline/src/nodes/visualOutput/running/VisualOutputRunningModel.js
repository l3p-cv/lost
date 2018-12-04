import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class VisualOutputRunningModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, visualOutput } = params

		super({ peN, peOut, mode })

		this.id = id
		// what is this?
		this.visualOutput = visualOutput
		// for progress bar updates
		this.state = new Observable(state)
    }
}