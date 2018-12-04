// import { Observable } from 'l3p-frontend'


export default class BaseNodeModel {
	constructor(params){
		if(params === undefined || params.peN === undefined){
            throw new Error('Graph-Node parameters are or do not contain a peN property.')
        }
		const { peN, peOut, mode } = params
		this.mode = mode
		this.peN = peN
		this.peOut = peOut
	}
	// may be overridden
	isValidated(){
		return true
	}
}