import $ from "cash-dom"

import { NodeTemplate } from "l3p-frontend"


export const lastImageModal = new NodeTemplate(`
    <div id="sia-finish-task-modal" class="modal fade">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title">Do you realy want to finish?</h1>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h4>If you finish the annotation task now, you can no longer change the current task.</h4>
                </div>
                <div class="modal-footer">
                    <button data-ref="finish-button" type="button" class="btn btn-primary" data-dismiss="modal" data-target="#sia-finish-task-modal">Finish</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" data-target="#sia-finish-task-modal">Abort</button>
                </div>
            </div>
        </div>
    </div>
`)
export function showLastImageModal() {
    $(lastImageModal.root).modal()
}


document.body.appendChild(lastImageModal.fragment)
