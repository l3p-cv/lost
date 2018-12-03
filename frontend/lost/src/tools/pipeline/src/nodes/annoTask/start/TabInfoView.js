import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import AnnoTaskNodeModel from '../AnnoTaskNodeModel';


export default class TabInfoView extends WizardTabView {
    constructor({ state }: AnnoTaskNodeModel){
		const { name, instructions } = state
        super({
            title: 'Fill Out',
            icon: 'fa fa-info fa-1x',
            content: /*html*/`
                <form class='form-horizontal form-label-left' novalidate='true'>
                    <div class='item form-group'>
                        <label class='control-label' for='anno_name'>
                            Name
							// use css after!
                            <span class='required'>*</span>
                        </label>
                        <div class=''>          
                            <input type='text' data-ref='name' name='anno_name' value='${name}'
                                required='required' class='form-control'
                                placeholder='name'>
                        </div>
                    </div>
                    
                    <div class='item form-group'>
                        <label class='control-label' for='anno_instructions'>
                            Instructions
							// use css after!
                            <span class='required'>*</span>
                        </label>
                        <div class=''>
                            <input data-ref='instructions' type='text' name='anno_instructions' value='${instructions}'
                                required='required' class='form-control'
                                placeholder='instructions'>
                        </div>
                    </div>        
                </form>
            `,
        })
    }
}