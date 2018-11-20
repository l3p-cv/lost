import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import './SelectPipeline.scss'
import 'datatables.net'
import 'datatables.net-buttons'

class SelectPipelineView extends WizardTabView {
    constructor(){
        super({
            title: 'Choose Template',
            icon: 'fa fa-puzzle-piece fa-1x',
            content: /*html*/`
                <h4> Right Click on Row to open Context menu </h4>
                <table data-ref='templatetable' class='table table-striped table-bordered'></table>
            `,
        })
    }
}
export default new SelectPipelineView()