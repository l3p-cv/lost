import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class AnnoTaskStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, annoTask } = params

		super({ peN, peOut, mode })

		this.state = {
			name: annoTask.name,
			instructions: annoTask.instructions,
			// group name
			assignee: '',
			// group id
			workerId: undefined,
			selectedLabelTree: new Observable([]),
			// whats this?
			labelLeaves: [],
			// whats this?
			groups: [],
		}		

		// for wizard navigation
		this.controls = {
			show1: new Observable(true),
			show2: new Observable(false),
			show3: new Observable(false),
			show4: new Observable(false),
		}
    }
	isValidated(){
		// not finished
		return false
	}
	getOutput(){
		return this.state
	}
}