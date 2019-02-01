import { Observable } from 'l3p-frontend'
import BaseNodeModel from '../../BaseNodeModel'


export default class AnnoTaskStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, annoTask } = params
		// some parts of the annotation task may be configurated in frontend.
		// those are hold in this.state.
		// only a fraction (everything that is not in this.state) is passed to super.
		const { type, configuration } = annoTask
		super({ peN, peOut, annoTask: { type, configuration } })

		this.state = {
			// wizzard tab 1.
			name: annoTask.name,
			instructions: annoTask.instructions,
			// wizzard tab 2.
			// - assignee = group name
			assignee: new Observable(''),
			// - workerId = group id
			workerId: undefined,
			// wizzard tab 3.
			selectedLabelTree: new Observable([]),
			// wizzard tab 4.
			selectedLabels: [],
		}
    }
	isValidated(){
		const { name, instructions, assignee, workerId, selectedLabelTree } = this.state
		let result = true
		result = result && name.length > 0
		result = result && instructions.length > 0
		result = result && assignee.value.length > 0
		result = result && !isNaN(workerId)
		result = result && !selectedLabelTree.isInInitialState
		// label selection still missing here.
		return result
	}
	getOutput(){
		const { peN, peOut } = this
		const { name, instructions, assignee, workerId, selectedLabelTree, selectedLabels: labelLeaves } = this.state
		const { type, configuration } = this.annoTask
		return {
			peN,
			peOut,
			annoTask: {
				assignee: assignee.value,
				configuration,
				workerId,
				instructions,
				name,
				selectedLabelTree: selectedLabelTree.value.idx,
				labelLeaves,
				type,
			}
		}
	}
}