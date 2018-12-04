import BaseNodeModel from '../../BaseNodeModel'


export default class ScriptStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, script } = params

		super({ peN, peOut, mode })
		
        this.id = id

		// data structure?
        this.script = script   
    }
	isValidated(){
		if(this.script.arguments){
			return this.script.arguments.every(argument => argument.lenght > 0)
		}
		return true
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