import { Observable } from "l3p-frontend"


export default class DataExportNodeModel {
    constructor(data, mode) {
        if(data === undefined || data.peN === undefined){
            throw new Error("data is undefined or has no peN property.")
        }
        if(mode === "start"){
            this.peN = data.peN
            this.peOut = data.peOut
            this.dataExport = ""
            this.validation = true            
        }else if(mode === "running"){
            this.peN = data.peN
            this.peOut =  data.peOut
            this.id = data.id
            this.state = new Observable(data.state)
            this.dataExport = data.dataExport
        }
      
    }
}