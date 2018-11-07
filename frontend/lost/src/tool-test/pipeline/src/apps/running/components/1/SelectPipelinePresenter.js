import WizardTabPresenter from "wizard/WizardTabPresenter"
import appModel from "../../appModel"
import swal from "sweetalert2"
import SelectPipelineView from "./SelectPipelineView"
import PipelineGraphPresenter from "../2/PipelineGraphPresenter"
import * as data from "core/data"
import { mouse, ContextMenu } from "l3p-core"
import "l3p-core/build/context-menu.css"
import $ from "jquery"

import moment from 'moment'

import "datatables.net-bs"


let templateDatatable


class SelectPipelinePresenter extends WizardTabPresenter {
    constructor() {
        super()
        this.view = SelectPipelineView
        let that = this
        this.isTabValidated = false
        
        // VIEW-BINDING
        $(this.view.html.refs["templatetable"]).on("click", "tbody td", (e) => {

            let templateId = templateDatatable.row($(e.currentTarget).parent()).data()[0]
            if ($(e.currentTarget).text() != "Delete Pipeline") {
                this.selectTemplate(templateId)
            }


        })
        $(this.view.html.refs["templatetable"]).on("contextmenu", "tbody td", (e) => {
            e.preventDefault()
            let templateId = templateDatatable.row($(e.currentTarget).parent()).data()[0]
            let row = templateDatatable.row($(e.currentTarget).parent())

            function deletePipeline(){
                data.deletePipe(templateId).then((isSuccess) => {
                    if (isSuccess == "cancel") {
                        return
                    } else if (isSuccess) {
                        row.remove().draw(false)                        
                    }
                })
            }
            function downloadLogfile(){
                if (that.rawData[0].logfilePath) {
                    window.location = window.location.origin + "/" + that.rawData[0].logfilePath
                } else {
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: 'Logfile does not exist',
                    })
                }
            }

            if(appModel.isCompleted){
                let cm = new ContextMenu(e, {
                    name: "Delete Pipeline",
                    icon: "fa fa-trash",
                    fn: () => {
                        deletePipeline()
                    },
                },
                {
                    name:"Download Logfile",
                    icon:"fa fa-download",
                    fn: () =>{
                        downloadLogfile()
                    }
                });
            }else{
                let cm = new ContextMenu(e, {
                    name: "Delete Pipeline",
                    icon: "fa fa-trash",
                    fn: () => {
                        deletePipeline()
                    }
                },
                {
                    id: "pause",
                    name: "Pause Pipeline",
                    icon: "fa fa-pause",
                    fn: () => {
                        data.pausePipe({"pipeId": templateId}).then((isSuccess)=>{
                            if(isSuccess){
                                location.reload()
                            }
                        })   
                    }
                },
                {
                    id: "play",
                    name: "Play Pipeline",
                    icon: "fa fa-play",
                    fn: () => {
                         data.playPipe({"pipeId": templateId}).then((isSuccess)=>{
                            if(isSuccess){
                                location.reload()
                            }
                        })                          
                    }
                },
                {
                    name:"Download Logfile",
                    icon:"fa fa-download",
                    fn: () =>{
                        downloadLogfile()
                    }
                })
            }

        });
        // Delete Button
        $(this.view.html.refs["templatetable"]).on('click', 'button', function () {
            let templateId = templateDatatable.row($(this).parents('tr')).data();
            //data.deletePipe(templateId)
            //alert( data[0] + "delete Pipe");
        });
        // MODEL-BINDING
        appModel.data.pipelineTemplates.on("update", (data) => this.updateTable(data))
    }
    /**
     * @extend
     */
    validate() {
        super.validate(() => {
            // ...
            return true
        })
    }
    updateTable(rawData) {
        this.rawData = rawData
        // If user Start pipe --> show graph
        let pathname = window.location.pathname
        let loadThisTemplate =  pathname.substring(pathname.lastIndexOf("/") +1 , pathname.length)
        if(!isNaN(parseInt(loadThisTemplate))){
            this.selectTemplate(parseInt(loadThisTemplate))            
        }

        if (rawData !== undefined) {
            const data = rawData.map(pipe => {
                if(pipe.progress == "ERROR"){
                    pipe.progress = `<span class="label label-danger">${pipe.progress}</span>`                    
                }else if(pipe.progress == "PAUSED"){
                    pipe.progress = `<span class="label label-warning">${pipe.progress}</span>`                                        
                }
                let date  = new Date(pipe.date)
                let formatedDate = moment(date).format('MMMM Do YYYY, HH:mm:ss');
                return [
                    pipe.id,
                    pipe.name,
                    pipe.description,
                    pipe.templateName,
                    pipe.creatorName,
                    pipe.progress,
                    formatedDate,
                ]
            })

            templateDatatable = $(this.view.html.refs["templatetable"]).DataTable({
                data,
                order: [[ 6, "desc" ]],                         
                columnDefs: [{
                    targets: [0],
                    visible: false,
                },
                {
                    targets:[5],
                    type: 'date',

                    
                }],
                columns: [{
                        title: "ID"
                    },
                    {
                        title: "Name"
                    },
                    {
                        title: "Description"
                    },
                    {
                        title: "Template Name"
                    },
                    {
                        title: "Author"
                    },
                    {
                        title: "Progress"
                    },
                    {
                        title: "Date"
                    },
                ]
            })


        }
    }
    selectTemplate(id: Node) {
        let requestGraph = () => {
            if (typeof id === "number") {
                this.isTabValidated = true
                // Completed                
                if(appModel.isCompleted){
                    data.requestCompletedPipe(id).then(response => {
                        appModel.state.selectedPipe.update(response)
                    })
                }else{
                    // Running
                    data.requestRunningPipe(id).then(response => {
                        if(typeof response == "string"){
                            swal(
                                'Oops...',
                                response,
                                'error'
                              )
                        }else{
                            appModel.state.selectedPipe.update(response)                            
                        }
                        //response = JSON.parse(response)
                    })
                }
            }
        }
        requestGraph()
    }

    isValidated(){
        return (this.isTabValidated)
    }
}
export default new SelectPipelinePresenter()




