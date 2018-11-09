import WizardTabView from "wizard/WizardTabView"
import $ from "jquery"
import "datatables.net"
import "datatables.net-buttons"

class TabSelectTreeView extends WizardTabView {
    constructor(model) {
        // the config object can be declared outside
        // of the class or directly into the super call aswell.
        const config = {
            title: "Select Tree",
            icon: "fa fa-tree fa-1x",
            content: `
            <div class="row">
            <table data-ref="table-tree" class="table table-striped table-bordered" cellspacing="0" width="100%"> </table>
            </div>
            `,
        }
        super(config)
    }
}
export default TabSelectTreeView