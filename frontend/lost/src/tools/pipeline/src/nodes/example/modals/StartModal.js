import { BaseModal } from 'pipRoot/l3pfrontend/index'


export default class ExampleStartModal extends BaseModal {
    constructor(nodeModel: any){
        const params = {
            title: 'Example Start Modal',
            content: /*html*/`
                <h2>start</h2>
                <input data-ref='info' type='text' value='${nodeModel.text.value}'/>
            `   
        }
        super(params)

        // focus input field
        $(this.view.root).on('shown.bs.modal', (e) => {
            $(e.target).find('[data-ref=info]').focus()
        })
        // update node on change
        $(this.view.refs['info']).on('input', (e) => {
            nodeModel.text.update(e.target.value)
        })
    }
    setInfoText(text: string){
        this.view.refs['info'].value = text
    }
}