import { BaseModal } from 'pipRoot/l3pfrontend/index'

import { Wizard } from 'pipRoot/l3pfrontend/index'
import TabInfoPresenter from './wizard/1/TabInfoPresenter'
import TabUserPresenter from './wizard/2/TabUserPresenter'
import TabSelectTreePresenter from './wizard/3/TabSelectTreePresenter'
import TabTreePresenter from './wizard/4/TabTreePresenter'


export default class AnnoTaskStartModal extends BaseModal {
    constructor(node: AnnotaskStartNodePresenter){
        super({
			id: 'anno-task-modal',
			title: 'Annotation Task',
			content: /*html*/`
				<div id='anno-task-modal-wizard'></div>
			` 
        })
		
        this.wizard = new Wizard(this.html.ids['anno-task-modal-wizard'])  

        let tab1 = new TabInfoPresenter(node)
        let tab2 = new TabUserPresenter(node)
        let tab3 = new TabSelectTreePresenter(node)
        let tab4 = new TabTreePresenter(node)
        
        tab4.requiresValid(tab3)
        
        this.wizard.add([
          tab1,
          tab2,
          tab3,
          tab4
        ])
	}
}
  