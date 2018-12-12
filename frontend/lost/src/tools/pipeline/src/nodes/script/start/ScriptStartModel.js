import BaseNodeModel from '../../BaseNodeModel'


export default class ScriptStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, id, script } = params

		super({ peN, peOut })
		
        this.id = id

		// data structure?
        this.script = script
    }
	isValidated(){
		if(this.script.arguments){
			return Object.values(this.script.arguments).every(argument => (argument.value.length > 0))
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