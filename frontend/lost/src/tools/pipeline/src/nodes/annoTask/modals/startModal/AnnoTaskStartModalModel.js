import { Observable } from "pipRoot/l3pfrontend/index"


export default class AnnoTaskStartModalModel{
    constructor(){
        this.controls = {
            show1: new Observable(-1),
            show2: new Observable(-1),
            show3: new Observable(-1),
            show4: new Observable(-1),
        }
    }
}