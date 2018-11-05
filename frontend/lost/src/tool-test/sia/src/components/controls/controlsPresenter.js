import * as view from "./controlsView"

// apply collapse state from local storage
$(window).on("load", collapseHandler)

function collapseHandler(){
    let closeManual = JSON.parse(localStorage.getItem("sia-collapse-manual"))
    $("#sia-collapse-manual").parent().off("click", saveCollapseManual)
    if(closeManual) $("#sia-collapse-manual").click()
    $("#sia-collapse-manual").parent().on("click", saveCollapseManual)
}
function saveCollapseManual(e) {
    console.log("e.target:", e.target)
    let classString = (e.target.localName === "a")
        ? $(e.target).children().first().attr("class")
        : $(e.target).attr("class")
    let close = (classString.includes("down") === true) ? true : false
    localStorage.setItem("sia-collapse-manual", JSON.stringify(close))
}

export function hide(){
    view.hide()
}
export function show(){
    view.show()
}
