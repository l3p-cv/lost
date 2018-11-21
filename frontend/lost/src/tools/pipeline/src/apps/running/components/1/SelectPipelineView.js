import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import './SelectPipeline.scss'



class SelectPipelineView extends WizardTabView {
    constructor(){
        super({
            title: 'Choose a Template',
            icon: 'fa fa-puzzle-piece fa-1x',
            content: /*html*/`
                <h4> Right Click on Row to open Context menu </h4>
                <table data-ref='templatetable' class='table table-striped table-bordered'></table>
            `,
        })
    }
}
export default new SelectPipelineView()