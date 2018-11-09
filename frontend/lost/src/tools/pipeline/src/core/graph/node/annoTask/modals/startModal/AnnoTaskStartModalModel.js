import { Observable } from "l3p-frontend"

// export default {
//     controls: {
//         show1: new Observable(-1),
//         show2: new Observable(-1),
//         show3: new Observable(-1),
//         show4: new Observable(-1),
//     }
// }


export default class AnnoTaskStartModalModel{
    constructor(){
       this.controls= {
        show1: new Observable(-1),
        show2: new Observable(-1),
        show3: new Observable(-1),
        show4: new Observable(-1),
    }
    }

}