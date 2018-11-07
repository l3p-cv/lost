import $ from "jquery"

import WizardTabPresenter from "wizard/WizardTabPresenter"
import StartPipelineView from "./StartPipelineView"
import SelectPipelinePresenter from "../1/SelectPipelinePresenter"
import PipelineGraphPresenter from "../2/PipelineGraphPresenter"
import ConfigPipelinePresenter from "../3/ConfigPipelinePresenter"
import * as data from "pipRoot/core/data"
import swal from "sweetalert2"
import appModel from "../../appModel"

const postJson = {}
class StartPipelineTab extends WizardTabPresenter {
    constructor() {
        super()
        this.view = StartPipelineView
        appModel.controls.show4.on("update", () => this.show())
        $(this.view.html.refs["btn-prev"]).on('click', () => {
            appModel.controls.show3.update(true)
        })

        $(this.view.html.refs.btnStartPipe).on('click', () => {
            postJson.elements = []
            if (ConfigPipelinePresenter.validated == false) {
                alert("Please go to third tab")
                return
            }
            if (PipelineGraphPresenter.validated == false) {
                alert("Please go to second tab")
                return
            }
            postJson.templateId = SelectPipelinePresenter.templateId
            postJson.name = ConfigPipelinePresenter.name
            postJson.description = ConfigPipelinePresenter.description
            postJson.isDebug = appModel.isDebug
            console.log('===========postJson=========================');
            console.log(postJson);
            console.log('====================================');
            const allNodePresenter = PipelineGraphPresenter.graph.graph._nodes
            Object.keys(allNodePresenter).forEach(n => {
                if (allNodePresenter[n].nodePresenter.model.post !== undefined) {
                    postJson.elements.push(allNodePresenter[n].nodePresenter.model.post)
                }
            })
            data.startPipe(postJson).then(response => {
                console.log('========postJson============================');
                console.log(postJson);
                console.log('====================================');
                swal({
                    position: 'top-right',
                    type: 'success',
                    title: 'Started pipe successfully ',
                    text: 'You will be redirected to running pipe',
                    showConfirmButton: false,
                    timer: 1500
                }).then(
                    function () { },
                    function () {
                        if (appModel.isDebug) {
                            window.location = "/pipeline/debug/running/" + response
                        } else {
                            window.location = "/pipeline/running/" + response
                        }
                    }
                )
            })


            // Welche URL
        })

    }
    /**
     * @extend
     */
    // validate() {
    //     super.validate(() => {
    //         // ...
    //         return true
    //     })
    // }
}
export default new StartPipelineTab()