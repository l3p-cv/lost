import { BaseModal } from 'l3p-frontend'

import { Wizard } from 'l3p-frontend'
import TabInfoPresenter from './TabInfoPresenter'
import TabUserPresenter from './TabUserPresenter'
import TabSelectTreePresenter from './TabSelectTreePresenter'
import TabTreePresenter from './TabTreePresenter'


export default class AnnoTaskStartModal extends BaseModal {
    constructor(nodeModel: AnnotaskStartNodeModel){
        super({
			id: 'anno-task-modal',
			title: 'Annotation Task',
			content: /*html*/`
				<div id='anno-task-modal-wizard'></div>
			` 
        })
		
        this.wizard = new Wizard(this.html.ids['anno-task-modal-wizard'])  

        let tab1 = new TabInfoPresenter(nodeModel)
        let tab2 = new TabUserPresenter(nodeModel)
        let tab3 = new TabSelectTreePresenter(nodeModel)
        let tab4 = new TabTreePresenter(nodeModel)
		
        tab4.requiresValid(tab3)
		tab2.on('after-activate', () => {
			tab2.adjustDataTable()
		})
		tab3.on('after-activate', () => {
			tab3.adjustDataTable()
		})

		this.wizard.add([
          tab1,
          tab2,
          tab3,
          tab4
        ])
		
	}
}
  