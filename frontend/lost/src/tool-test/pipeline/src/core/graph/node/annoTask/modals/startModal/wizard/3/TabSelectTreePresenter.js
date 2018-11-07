import WizardTabPresenter from "wizard/WizardTabPresenter"
import TabSelectTreeView from "./TabSelectTreeView"
import $ from "jquery"
import "datatables.net"
import "datatables.net-buttons"
import TabTreePresenter from "../4/TabTreePresenter"
import swal from 'sweetalert2'
let labelTrees

class TabSelectTreePresenter extends WizardTabPresenter {
    constructor(presenter, modalView) {
        super()
        let model = presenter.model
        this.view = new TabSelectTreeView(model)
        presenter.modalModel.controls.show3.on("update", () => this.show())
        this.validated = false
        let TreeTable = $(this.view.html.refs["table-tree"]).DataTable({
            lengthMenu: [
                [3, 5],
                [3, 5]
            ],
            order: [
                [1, "asc"]
            ],
            autoWidth: false,
            data: model.annoTask.availableLabelTrees,
            columns: [
                {
                    data: 'id',
                    title: 'Id'
                },
                {
                    data: 'name',
                    title: 'Name'
                },
                {
                    data: 'userName',
                    title: 'User Name'
                },
                {
                    data: 'description',
                    title: 'Description'
                },
                {
                    data: 'timestamp',
                    title: 'Timestamp'
                },
            ],
        });

        $(this.view.nav.refs["a"]).on("click", () => {
            modalView.view.refs["outerModal"].style.width = '50%'
    })



        $(this.view.html.refs["table-tree"]).find("tbody").on('click', 'tr', (e) => {
            let requestGraph = () => {
                TreeTable.$('tr.selected').removeClass('selected')
                $(e.currentTarget).addClass('selected')
                model.annoTask.availableLabelTrees.forEach(element => {
                    if (element.id == $(e.currentTarget.childNodes[0]).text()) {
                        // THIS LOADS THE LABEL GRAPH
                        this.validated = true
                        presenter.modalModel.controls.show4.update(element)
                    }
                })
            }

            if (TreeTable.$('tr.selected').hasClass('selected') == true) {
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
        });
    }
    isValidated() {

        return this.validated
    }
}
export default TabSelectTreePresenter