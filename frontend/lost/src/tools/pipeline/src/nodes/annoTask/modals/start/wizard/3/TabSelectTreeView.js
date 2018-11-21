import { WizardTabView } from 'pipRoot/l3pfrontend/index'





export default class TabSelectTreeView extends WizardTabView {
    constructor(model) {
        super({
            title: 'Select Label Tree',
            icon: 'fa fa-database fa-1x',
            content: /*html*/`
                <div class='row'>
                    <table data-ref='table-tree' class='table table-striped table-bordered'></table>
                </div>
            `,
        })
    }
}