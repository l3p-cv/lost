import { Observable } from 'pipRoot/l3pfrontend/index'
import BaseNodeModel from '../BaseNodeModel'


export default class AnnoTaskNodeModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, state, annoTask } = params

		super({ peN, peOut })

        if(mode === 'start'){
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

		if(mode === 'running'){
            this.id = id
            this.annoTask = annoTask
			// for progress bar updates
            this.state = new Observable(state)
            this.progress = new Observable(annoTask.progress ? annoTask.progress : 0)
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