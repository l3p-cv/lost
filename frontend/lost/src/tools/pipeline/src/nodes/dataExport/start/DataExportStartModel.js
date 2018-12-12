import BaseNodeModel from '../../BaseNodeModel'


export default class DataExportStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut } = params	
		
		super({ peN, peOut })

		this.dataExport = ''
    }
}