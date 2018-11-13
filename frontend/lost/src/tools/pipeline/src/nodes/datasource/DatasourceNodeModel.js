import { Observable } from "l3p-frontend"

export default class DatasourceNodeModel {
    constructor(data, mode) {
        console.log("DATA:": data)
        console.log("STATE:": data.state)
        if(data === undefined || data.peN === undefined){
            throw new Error("data is undefined or has no peN property.")
        }
        if(mode === "start"){
            this.peN = data.peN
            this.peOut = data.peOut
            this.datasource = data.datasource
            this.post = {}
            this.post.peN = data.peN
            this.post.datasource = {}
            this.validation = false            
        }else if(mode === "running"){
            this.peN = data.peN
            this.peOut = data.peOut
            this.state = new Observable(data.state)
            this.id = data.id
            this.datasource = data.datasource
        }
            
    
    }
}