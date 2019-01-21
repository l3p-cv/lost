import "./app.styles.scss"
import { NodeTemplate } from "l3p-frontend"

import * as imageView from "./components/image/imageView"
import * as propertiesView from "./components/properties/propertiesView"
import * as toolbarView from "./components/toolbar/toolbarView"

export const html = new NodeTemplate(`
    <div id="sia-drawer-panel" class="container">
        <div id="sia-drawer-content" class="row">
            <div id="sia-content-wrapper"></div>
        </div>
    </div>
`)
// append views (would be nice to be able to directly embed nodetemplates)
html.ids["sia-content-wrapper"].appendChild(toolbarView.html.fragment)
html.ids["sia-content-wrapper"].appendChild(propertiesView.html.fragment)
html.ids["sia-content-wrapper"].appendChild(imageView.html.fragment)
// moved mounting to SIA Component

// REMOVE
export function show(){
    // document.getElementById("bba-progress-bar").style.display = "block"
    // html.ids["sia-app-hide-plane"].style.display = "none"
}
// REMOVE
export function hide(){
    // document.getElementById("bba-progress-bar").style.display = "none"
    // html.ids["sia-app-hide-plane"].style.display = "block"
}
