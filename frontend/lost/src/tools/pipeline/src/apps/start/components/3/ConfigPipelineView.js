import { WizardTabView } from 'l3p-frontend'


class ConfigPipelineTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Enter Name and Description',
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
	updateName(name: String){
		this.html.refs['name'].value = name
	}
	updateDescription(description: String){
		this.html.refs['description'].value = description
	}
}
export default new ConfigPipelineTab()