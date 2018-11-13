import { WizardTabPresenter } from "pipRoot/l3pfrontend/index"
import TabUserView from "./TabUserView"
import AnnoTaskStartView from "../../../../views/AnnoTaskStartView"

import "datatables.net"
import "datatables.net-buttons"


export default class TabUserPresenter extends WizardTabPresenter {
    constructor(presenter, modalView) {
        super()
        this.model = presenter.model
        this.view = new TabUserView(this.model)

        // DATATABLES
        const modifiedAvailableUser = this.model.annoTask.availableGroups
        console.log(this.model.annoTask.availableGroups)
        modifiedAvailableUser.forEach(element => {
            // element.photoPath = `<img src="${element.photoPath}" style="height:100px; width:100px">`
            element.photoPath = ""
        })
        const userTable = $(this.view.html.refs.dataTableUser).DataTable({
            lengthMenu: [
                [3, 10, 20, 50, -1],
                [3, 10, 20, 50, "All"],
            ],
            order: [
                [1, "asc"],
            ],
            autoWidth: false,
            data: modifiedAvailableUser,
            columns: [
                {
                    data: 'id',
                    title: 'ID',
                },
                {
                    data: 'photoPath',
                    title: 'Image',
                },
                {
                    data: 'groupName',
                    title: 'Name',
                },
            ],
            columnDefs: [
                {
                    "width": "0%",
                    "targets": 0,
                },
                {
                    "width": "0%",
                    "targets": 1,
                },
                {
                    "width": "100%",
                    "targets": 2,
                },
            ]
        })
        const groupTable = $(this.view.html.refs.dataTableGroup).DataTable({
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
                    data: 'groupName',
                    title: 'Name'
                },
            ],
        })

        // VIEW BINDINGS
        $(this.view.nav.root).on("click", () => {
            modalView.view.refs["outerModal"].style.width = '50%'
        })
        $(this.view.html.refs.dataTableUser).find("tbody").on('click', 'tr', (e) => {
            if ($(this.view.html.refs.spanGroup).text() !== "") {
                $(this.view.html.refs.spanGroup).text("")
                groupTable.$('tr.selected').removeClass('selected')
            }
            userTable.$('tr.selected').removeClass('selected')
            $(e.currentTarget).addClass('selected')
            // Show Name on header deprecated
            this.model.post.annoTask.workerId = parseInt($(e.currentTarget.children[0]).text())
            this.model.meta.assignee = $(e.currentTarget.children[2]).text()          
            presenter.view = new AnnoTaskStartView(this.model)
            presenter.modalModel.controls.show3.update(true)
        })
        $(this.view.html.refs.dataTableGroup).find("tbody").on('click', 'tr', (e) => {
            if($(this.view.html.refs.spanUser).text() !== "") {
                $(this.view.html.refs.spanUser).text("")
                userTable.$('tr.selected').removeClass('selected')
            }
            groupTable.$('tr.selected').removeClass('selected')
            $(e.currentTarget).addClass('selected')
            $(this.view.html.refs.spanGroup).text($(e.currentTarget.childNodes[1]).text())
        })
    }
    isValidated() {
        return true
    }
}