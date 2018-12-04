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

        this.tab1 = new TabInfoPresenter(nodeModel)
        this.tab2 = new TabUserPresenter(nodeModel)
        this.tab3 = new TabSelectTreePresenter(nodeModel)
        this.tab4 = new TabTreePresenter(nodeModel)
		
        this.tab4.requiresValid(this.tab3)
		this.tab2.on('after-activate', () => {
			this.tab2.adjustDataTable()
		})
		this.tab3.on('after-activate', () => {
			this.tab3.adjustDataTable()
		})

		this.wizard.add([
          this.tab1,
          this.tab2,
          this.tab3,
          this.tab4
        ])
	}
	getName(){
		return this.tab1.getName()
	}
	getAssignee(){
		return this.tab2.getAssignee()
	}
}
  