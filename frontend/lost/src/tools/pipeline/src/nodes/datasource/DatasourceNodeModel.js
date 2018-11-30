import { Observable } from 'pipRoot/l3pfrontend/index'


export default class DatasourceNodeModel {
    constructor(data: any, mode: String) {
        if(data === undefined || data.peN === undefined){
            throw new Error('data is undefined or has no peN property.')
        }
		this.peN = data.peN
		this.peOut = data.peOut
		this.datasource = data.datasource
		// mapFileTree(data.datasource.fileTree)
		this.validation = false
        if(mode === 'start'){
            this.state = {
				peN : this.peN,	// USED?
				path : new Observable(''),
				validated : new Observable(false),
			}
        }
		if(mode === 'running'){
            this.id = data.id // USED?
            this.state = new Observable(data.state) // what is data.state?
        }
    }
	// WRITE BASE NODE MODEL CLASS
	isValidated(){
		return !this.state.path.isInInitialState
	}
}
