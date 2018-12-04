import BaseNodeModel from '../../BaseNodeModel'


export default class ScriptStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, script } = params

		super({ peN, peOut, mode })
		
        this.id = id

		// data structure?
        this.script = script   
    }
	getOutput(){
		return {
			peN: this.peN,
			script: {
				arguments: this.script.arguments
			}
		}
	}
}