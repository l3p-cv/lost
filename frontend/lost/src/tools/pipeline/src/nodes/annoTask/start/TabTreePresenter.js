import { WizardTabPresenter } from 'l3p-frontend'

import TabTreeView from './TabTreeView'


export default class TabTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
        
		this.view = new TabTreeView(this.model)

        nodeModel.controls.show4.on('update', (data) => this.loadTemplate(data))
    }
    loadTemplate(){
    }
}
