import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class AnnoTaskStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, annoTask } = params

		super({ peN, peOut, mode })

		this.state = {
			name: annoTask.name,
			assignee: '',
			instructions: annoTask.instructions,
			workerId: undefined,
			labelLeaves: [],
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