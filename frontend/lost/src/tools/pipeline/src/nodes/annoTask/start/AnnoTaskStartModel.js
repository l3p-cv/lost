import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class AnnoTaskStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, annoTask } = params

		super({ peN, peOut })

		this.state = {
			// wizzard tab 1.
			name: annoTask.name,
			instructions: annoTask.instructions,
			// wizzard tab 2.
			// - assignee = group name
			assignee: '',
			// - workerId = group id
			workerId: undefined,
			// wizzard tab 3.
			selectedLabelTree: new Observable([]),
			// wizzard tab 4.
			selectedLabels: [],
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
		const { name, instructions, assignee, workerId, selectedLabelTree } = this.state
		let result = true
		result = result && name.length > 0
		result = result && instructions.length > 0
		result = result && assignee.length > 0
		result = result && !isNaN(workerId)
		result = result && !selectedLabelTree.isInInitialState
		// label selection still missing here.
		return result
	}
	getOutput(){
		const { name, instructions, assignee, workerId, selectedLabelTree, selectedLabels } = this.state
		return {
			name, instructions, assignee, workerId,
			selectedLabelTree: selectedLabelTree.value.idx,
			selectedLabels,
		}
	}
}