import { WizardTabView } from 'l3p-frontend'


class ConfigPipelineTab extends WizardTabView {
    constructor(){
        super({
            title: 'Enter Pipe Name and Description',
            icon: 'fa fa-list-alt',
            content: /*html*/`
                <label class='required colon'>Name</label>
                <input class='form-control' data-ref='input-name'>
                <label class='required colon'>Description</label>
                <input class='form-control' data-ref='input-description'>
				
                <div class='ln_solid'></div>

                <ul class='list-inline pull-right'>
                    <li><button class='btn btn-default prev-step'>Previous</button></li>
                    <li><button class='btn btn-primary next-step'>Save and continue</button></li>
                </ul>
            `,
        })
    }
}
export default new ConfigPipelineTab()