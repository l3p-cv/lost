import { WizardTabView } from 'l3p-frontend'


export default class TabInfoView extends WizardTabView {
    constructor({ state }: AnnotaskStartModel){
		const { name, instructions } = state
        super({
            title: 'Fill Out',
            icon: 'fa fa-info fa-1x',
            content: /*html*/`
                <form class='form-horizontal form-label-left' novalidate='true'>
                    <div class='item form-group'>
                        <label class='control-label required'>
                            Name
                        </label>
						<input 
							class='form-control'
							data-ref='name' 
							type='text' 
							value='${name}'
							placeholder='name'>
                    </div>       
                    <div class='item form-group'>
                        <label class='control-label required'>
                            Instructions
                        </label>
						<input
							class='form-control'
							data-ref='instructions'
							type='text'
						 	value='${instructions}'
							placeholder='instructions'>
                    </div>        
                </form>
            `,
        })
    }
	getName(){
		return this.view.html.refs['name']
	}
}