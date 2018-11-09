import $ from "jquery"

import BaseModal from "../../BaseModal"


export default class ExampleRunningModal extends BaseModal {
    constructor(nodeModel){
        
        const params = {
            title: "Example Create Modal",
            content: `
                <h2>start</h2>
                <input data-ref="info" type="text" value="${nodeModel.text.value}"/>
            `   
        }

        super(params)
        
        // focus input field
        $(this.view.root).on("shown.bs.modal", (e) => {
            $(e.target).find("input").focus()
        })

        // update node on change
        $(this.view.refs["info"]).on("input", (e) => {
            nodeModel.text.update(e.target.value)
        })

    }
    setInfoText(text: string){
        this.view.refs["info"].value = text
    }
}