import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class VisualOutputRunningModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, id, state, visualOutput } = params

		super({ peN, peOut, id, visualOutput })

		// for progress bar updates
		this.status = new Observable(state)
    }
}