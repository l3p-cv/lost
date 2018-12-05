import { WizardTabView } from 'l3p-frontend'


class ConfigPipelineTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Enter Pipe Name and Description',
            icon: 'fa fa-list-alt',
            content: /*html*/`
                <label class='required colon'>Name</label>
                <input class='form-control' data-ref='name'>
                <label class='required colon'>Description</label>
                <input class='form-control' data-ref='description'>
                <div class='ln_solid'></div>
            `,
        }
        super(config)
    }
}
export default new ConfigPipelineTab()