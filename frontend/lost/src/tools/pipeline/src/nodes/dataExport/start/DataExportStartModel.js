import BaseNodeModel from '../../BaseNodeModel'


export default class DataExportStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut } = params	
		
		super({ peN, peOut, mode })

		this.dataExport = ''
    }
}