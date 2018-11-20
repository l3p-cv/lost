import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import AnnoTaskNodeModel from '../../../../AnnoTaskNodeModel';


export default class TabInfoView extends WizardTabView {
    constructor({ annoTask }: AnnoTaskNodeModel){
		const { name, instructions } = annoTask
        super({
            title: 'Select Options',
            icon: 'fa fa-info fa-1x',
            content: /*html*/`
                <form class='form-horizontal form-label-left' novalidate='true'>
                    <div class='item form-group'>
                        <label class='control-label col-md-3 col-sm-3 col-xs-12' for='anno_name'>
                            Name
                            <span class='required'>*</span>
                        </label>
                        <div class='col-md-6 col-sm-6 col-xs-12'>          
                            <input type='text' data-ref='name' name='anno_name' value='${name}'
                                required='required' class='form-control col-md-7 col-xs-12'
                                placeholder='name'>
                        </div>
                    </div>
                    
                    <div class='item form-group'>
                        <label class='control-label col-md-3 col-sm-3 col-xs-12' for='anno_instructions'>
                            Instructions
                            <span class='required'>*</span>
                        </label>
                        <div class='col-md-6 col-sm-6 col-xs-12'>
                            <input data-ref='instructions' type='text' name='anno_instructions' value='${instructions}'
                                required='required' class='form-control col-md-7 col-xs-12'
                                placeholder='instructions'>
                        </div>
                    </div>        
                </form>
            `,
        })
    }
}