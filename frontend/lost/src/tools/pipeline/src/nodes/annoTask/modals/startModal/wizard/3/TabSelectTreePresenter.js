import { WizardTabPresenter } from "pipRoot/l3pfrontend/index"
import TabSelectTreeView from "./TabSelectTreeView"

import "datatables.net"
import "datatables.net-buttons"
import swal from 'sweetalert2'


export default class TabSelectTreePresenter extends WizardTabPresenter {
    constructor(presenter, modalView) {
        super()
        this.model = presenter.model    // what the hell is presenter?
        this.view = new TabSelectTreeView(this.model)
        this.validated = false

        // DATA TABLES
        const treeTable = $(this.view.html.refs["table-tree"]).DataTable({
            lengthMenu: [
                [3, 5],
                [3, 5],
            ],
            order: [
                [1, "asc"],
            ],
            autoWidth: false,
            data: this.model.annoTask.availableLabelTrees,
            columns: [
                {
                    data: 'id',
                    title: 'Id',
                },
                {
                    data: 'name',
                    title: 'Name',
                },
                {
                    data: 'userName',
                    title: 'User Name',
                },
                {
                    data: 'description',
                    title: 'Description',
                },
                {
                    data: 'timestamp',
                    title: 'Timestamp',
                },
            ],
        })

        // MODEL BINDINGS
        presenter.modalModel.controls.show3.on("update", () => this.show())
        
        // VIEW BINDINGS
        $(this.view.nav.root).on("click", () => {
            modalView.view.refs["outerModal"].style.width = '50%'
        })
        $(this.view.html.refs["table-tree"]).find("tbody").on('click', 'tr', (e) => {
            let requestGraph = () => {
                treeTable.$('tr.selected').removeClass('selected')
                $(e.currentTarget).addClass('selected')
                this.model.annoTask.availableLabelTrees.forEach(element => {
                    if (element.id === $(e.currentTarget.childNodes[0]).text()) {
                        // THIS LOADS THE LABEL GRAPH
                        this.validated = true
                        presenter.modalModel.controls.show4.update(element)
                    }
                })
            }

            if (treeTable.$('tr.selected').hasClass('selected') === true) {
                swal({
                    title: 'Are you sure to load the graph? ',
                    text: "Current labels will be removed. You won't be able to revert this!",
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
                    if (dismiss === 'cancel') {
                        return
                    }
                })
            } else {
                requestGraph()
            }
        })
    }
    isValidated(){
        return this.validated
    }
}