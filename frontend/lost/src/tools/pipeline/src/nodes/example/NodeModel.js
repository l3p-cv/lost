import { Observable } from "pipRoot/l3pfrontend/index"


export default class ExampleNodeModel {
    constructor(data) {
        if(data === undefined || data.peN === undefined){
            throw new Error("data is undefined or has no peN property.")
        }
        this.peN = data.peN
        this.title = data.title
        this.text = new Observable(data.text)
    }
}



