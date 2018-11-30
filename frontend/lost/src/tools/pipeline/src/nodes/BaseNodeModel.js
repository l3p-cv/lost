import { Observable } from 'pipRoot/l3pfrontend/index'


const DEFAULTS = {
}
export default class BaseNodeModel {
	constructor(params){
		params = Object.assign({}, DEFAULTS, params)
		
	}
	isValidated(){
		
	}
}