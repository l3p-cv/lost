import { BaseModal } from "pipRoot/l3pfrontend/index"


export default class DataExportStartModal extends BaseModal {
    constructor(nodeModel){
        const params = {
            visible: false,
            title: "Export",
            content: `
                Start Modal
            `   
        }
        super(params)
    }
}