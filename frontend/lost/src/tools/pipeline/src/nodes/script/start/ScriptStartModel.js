import BaseNodeModel from '../../BaseNodeModel'


export default class ScriptStartModel extends BaseNodeModel {
    constructor(params) {
		super(params)
    }
	isValidated(){
		if(this.script.arguments){
			return Object.values(this.script.arguments).every(argument => (argument.value.length > 0))
		}
		return true
	}
	getOutput(){
		const output = Object.getOwnPropertyNames(this).reduce((result, key) => {
			result[key] = this[key]
			return result
		}, {})
		output.script.isDebug = false
		return output
	}
}