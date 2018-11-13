import { BaseModal } from "pipRoot/l3pfrontend/index"

import { Wizard } from "pipRoot/l3pfrontend/index"
import TabInfoPresenter from "./wizard/1/TabInfoPresenter"
import TabUserPresenter from "./wizard/2/TabUserPresenter"
import TabSelectTreePresenter from "./wizard/3/TabSelectTreePresenter"
import TabTreePresenter from "./wizard/4/TabTreePresenter"


export default class AnnoTaskStartModal extends BaseModal {
    constructor(presenter, graph){
        super({
          id: "anno-task-modal",
          title: "Annotation Task",
          content: `
            <div data-ref="WizardContent"></div>
          ` 
        })
        this.wizard = new Wizard(this.view.refs["WizardContent"])  
        let tab1 = new TabInfoPresenter(presenter, this)
        let tab2 = new TabUserPresenter(presenter, this)
        let tab3 = new TabSelectTreePresenter(presenter, this)
        let tab4 = new TabTreePresenter(presenter, this)
        
        tab4.requiresValid(tab3)
        
        this.wizard.add([
          tab1,
          tab2,
          tab3,
          tab4
        ])

        // Everytime Rerender the Graph by closing the modal

        

        
        }
      }
  