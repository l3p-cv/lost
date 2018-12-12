import { BaseModal } from 'l3p-frontend'


export default class VisualOutputRunningModal extends BaseModal {
    constructor(nodeModel){
		const { visualOutput } = nodeModel
        super({
            visible: visualOutput.length === 0 ? false : true,
            title: 'Visualisazion',
            content: /*html*/`
                ${visualOutput.map(element => `
                    <h3 class='align-center'>${element.iteration}</h3>
                    <img class='imageview' src='${element.imagePath}' alt='${element.imagePath} not found'>
                    <div class ='allign-center'>                
                        ${element.htmlOutput}
                    </div>
                `)}
            `   
        })
    }
}