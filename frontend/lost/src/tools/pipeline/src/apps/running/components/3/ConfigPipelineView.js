import { WizardTabView } from 'pipRoot/l3pfrontend/index'

class ConfigPipelineTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Enter Pipe Name and Description',
            icon: 'fa fa-list-alt',
            content: /*html*/`
                <label for='pipe_name'>Name *:</label>
                <input data-ref='input-name' type='text' id='pipe_name' class='form-control' name='pipe_name' required=''>
                <label for='pipe_description'>Description *:</label>
                <input data-ref='input-description' type='text' id='pipe_description' class='form-control' name='pipe_description' data-parsley-trigger='change' required=''>
                <div class='ln_solid'></div>
        
                <ul class='list-inline pull-right'>
                    <li><button type='button' class='btn btn-default prev-step'>Previous</button></li>
                    <li><button type='button' class='btn btn-primary next-step'>Save and continue</button></li>
                </ul>
            `,
        }
        super(config)
    }
}
export default new ConfigPipelineTab()