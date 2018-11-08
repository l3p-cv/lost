import WizardTabPresenter from "wizard/WizardTabPresenter"
import TabUserView from "./TabUserView"
import AnnoTaskStartView from "../../../../views/AnnoTaskStartView"
import $ from "jquery"
import "datatables.net"
import "datatables.net-buttons"


class TabUserPresenter extends WizardTabPresenter {
    constructor(presenter, modalView) {
        super()
        let model = presenter.model
        this.view = new TabUserView(model)
        $(this.view.nav.refs["a"]).on("click", () => {
            modalView.view.refs["outerModal"].style.width = '50%'
        })
        const modifiedAvailableUser = model.annoTask.availableGroups
        modifiedAvailableUser.forEach(element => {
            element.photoPath = "<img src=" + element.photoPath + " style='height:100px; width:100px'>"
        })
        let userTable = $(this.view.html.refs.dataTableUser).DataTable({
            lengthMenu: [
                [3, 10, 20, 50, -1],
                [3, 10, 20, 50, "All"]
            ],
            order: [
                [1, "asc"]
            ],
            autoWidth: false,
            data: modifiedAvailableUser,
            columns: [{
                    data: 'id',
                    title: 'ID'
                },
                {
                    data: 'photoPath',
                    title: 'Image',
                    id: 'id'
                },
                {
                    data: 'name',
                    title: 'Name',
                    id: 'id'

                },

            ],
            columnDefs: [{
                    "width": "0%",
                    "targets": 0
                },
                {
                    "width": "0%",
                    "targets": 1
                },
                {
                    "width": "100%",
                    "targets": 2
                },
            ]
        });

        // Removed Table from TabUserView
        let groupTable = $(this.view.html.refs.dataTableGroup).DataTable({
            lengthMenu: [
                [3, 10, 20, 50, -1],
                [3, 10, 20, 50, "All"]
            ],
            order: [
                [1, "asc"]
            ],
            autoWidth: false,
            data: modifiedAvailableUser,
            columns: [{

                    data: 'photoPath',
                    title: 'Image'
                },
                {
                    data: 'name',
                    title: 'Name'
                },

            ],
        });

        $(this.view.html.refs.dataTableUser).find("tbody").on('click', 'tr', (e) => {
            if ($(this.view.html.refs.spanGroup).text() !== "") {
                $(this.view.html.refs.spanGroup).text("")
                groupTable.$('tr.selected').removeClass('selected');
            }
            userTable.$('tr.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected')
            // Show Name on header deprecated
          //  $(this.view.html.refs.spanUser).text(" " + $( e.currentTarget.children[2]).text())
            model.post.annoTask.workerId = parseInt($(e.currentTarget.children[0]).text())
            model.meta.assignee = $(e.currentTarget.children[2]).text()          
            presenter.view = new AnnoTaskStartView(model)
            presenter.modalModel.controls.show3.update(true)
        });

        // deprecated groups
        $(this.view.html.refs.dataTableGroup).find("tbody").on('click', 'tr', (e) => {
            if ($(this.view.html.refs.spanUser).text() !== "") {
                $(this.view.html.refs.spanUser).text("")
                userTable.$('tr.selected').removeClass('selected');
            }
            groupTable.$('tr.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected')
            $(this.view.html.refs.spanGroup).text($(e.currentTarget.childNodes[1]).text())

        });




        /*
        // change modal size when activating
        $(this.view.nav.refs["a"]).on("click", ()=>{
            document.getElementById("anno-task-modal").classList.toggle("modalAnnoTask", true)
        })
        */
    }
    /**
     * @override
     */
    /*
        deactivate(){
            super.deactivate()
            document.getElementById("anno-task-modal").classList.toggle("modalAnnoTask", false)
        }
    */

    isValidated() {
        return true
    }
}
export default TabUserPresenter