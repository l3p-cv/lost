import { WizardTabPresenter } from "pipRoot/l3pfrontend/index"
import appModel from "../../appModel"
import swal from "sweetalert2"
import SelectPipelineView from "./SelectPipelineView"
import PipelineGraphPresenter from "../2/PipelineGraphPresenter"
import * as http from "pipRoot/http"

import "datatables.net"
import "datatables.net-buttons"
let templateDatatable

class SelectPipelinePresenter extends WizardTabPresenter {
    constructor(){
        super()
        this.isTabValidated = false
        this.view = SelectPipelineView
        appModel.controls.show1.on("update", () => this.show())
        // VIEW-BINDING
        $(this.view.html.refs["templatetable"]).on("click", "tr", (e) =>{
            let templateId = templateDatatable.row(e.currentTarget).data()[0]            
            this.selectTemplate(templateId)
        })
        // MODEL-BINDING
        appModel.data.pipelineTemplates.on("update", (data) => this.updateTable(data))
    }
    // @override
    isValidated(){
        return (this.isTabValidated)
    }
    updateTable(rawData){
        // map raw data to the format 'datatables' accepts.
        const data = rawData.map(template => {
            return [
                template.id,
                template.name,
                template.description,
                template.author,
                new Date(template.date),
            ]
        })
        templateDatatable = $(this.view.html.refs["templatetable"]).DataTable({
            data,
            order: [[ 4, "desc" ]],         
            columnDefs:[{
                targets: [0],
                visible: false,
            }],
            columns: [
                { title: "ID"},                
                { title: "Name" },
                { title: "Description" },
                { title: "Author" },
                { title: "Date" },
            ]
        })   
        // DEBUG:
        // $(this.view.html.refs["templatetable"]).find("tr")[1].click()
    }
    selectTemplate(id: TemplateId){
        // request the template
        let requestGraph = () => {
            if (typeof id === "number") {
                http.requestTemplate(id).then(response => {
                    this.isTabValidated = true
                    this.templateId = id
                    //response = JSON.parse(response)
                    appModel.state.selectedTemplate.update(response)
                })
            }
        }

        if(PipelineGraphPresenter.isThereGraph){
            swal({
                title: 'Are you sure to load the graph? ',
                text: "Current graph will be removed. You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, do it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
              }).then(function () {
                requestGraph()
              }, function (dismiss) {
                // dismiss can be 'cancel', 'overlay',
                // 'close', and 'timer'
                if (dismiss === 'cancel') {
                    return
                }
              })
        }else{
            requestGraph()
        }

      
    }
}
export default new SelectPipelinePresenter()