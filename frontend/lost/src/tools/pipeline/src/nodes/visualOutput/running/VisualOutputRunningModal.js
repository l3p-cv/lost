import { BaseModal } from 'l3p-frontend'


export default class VisualOutputRunningModal extends BaseModal {
    constructor(nodeModel){
        const params = {
            visible: `${nodeModel.visualOutput.length === 0 ? `false`:`true`}`,            
            title: 'Visualisazion',
            content: /*html*/`
                ${nodeModel.visualOutput.map(element => `
                    <h3 class='allign-center'>${element.iteration}</h3>
                    <img src='${element.imagePath}' alt='${element.imagePath} not found' class='imageview'>
                    <div class ='allign-center'>                
                        ${element.htmlOutput}
                    </div>
                `)}
            `   
        }
        super(params)
    }
}