import { WizardTabView } from 'pipRoot/l3pfrontend/index'

import 'datatables.net'
import 'datatables.net-buttons'


export default class TabSelectTreeView extends WizardTabView {
    constructor(model) {
        super({
            title: 'Select Tree',
            icon: 'fa fa-tree fa-1x',
            content: `
                <div class='row'>
                    <table data-ref='table-tree' class='table table-striped table-bordered' cellspacing='0' width='100%'></table>
                </div>
            `,
        })
    }
}