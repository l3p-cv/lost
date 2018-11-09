import WizardTabView from "wizard/WizardTabView"
import "./SelectPipeline.scss"
import $ from "jquery"
// import dt from "datatables.net"; dt()
// import "datatables.net-buttons"
import "datatables.net"
import "datatables.net-buttons"

class SelectPipelineView extends WizardTabView {
    constructor(){
        super({
            title: "Choose Template",
            icon: "fa fa-puzzle-piece fa-1x",
            content: `
                <table data-ref="templatetable" class="table table-striped table-bordered"></table>
            `,
        })
        
    }

    
}
export default new SelectPipelineView()