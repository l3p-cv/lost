import $ from "jquery"
import "bootstrap"
import { BaseModal } from "l3p-frontend"

class FinishModal extends BaseModal {
	constructor(params){
		super({
			title: "Finish Annotation Task",
			content: /*html*/`
				<p>You can not return to the annotation task to make corrections after finishing it.</p>
			`,
		})
	}
}
export const finishModal = new FinishModal()
// should integrate mounting and show method to BaseModal.
export function show(){
    $(finishModal.html.root).modal()
}

document.body.appendChild(finishModal.html.fragment)
