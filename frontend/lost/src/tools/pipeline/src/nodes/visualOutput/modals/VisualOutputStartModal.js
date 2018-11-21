import { BaseModal } from 'pipRoot/l3pfrontend/index'


export default class VisualOutputStartModal extends BaseModal {
    constructor(nodeModel){
        const params = {
            visible: false,
            title: 'Visualisazion',
            content: /*html*/`
                Visualisazion Modal Start
            `   
        }
        super(params)
    }
}