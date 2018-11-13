import { WizardTabView } from 'pipRoot/l3pfrontend/index'

import 'datatables.net'
import 'datatables.net-buttons'


export default class TabUserView extends WizardTabView {
    constructor(model){
        super({
            title: ' ',
            icon: 'fa fa-user fa-1x',
            content: `
                <div class='container-fluid'>            
                    <table data-ref='dataTableUser' class='table table-striped table-bordered' cellspacing='0'></table>
                </div>
            `,
        })
    }
}