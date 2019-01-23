import "./app.styles.scss"
import { NodeTemplate } from "l3p-frontend"

import * as imageView from "./components/image/imageView"
import * as propertiesView from "./components/properties/propertiesView"
import * as toolbarView from "./components/toolbar/toolbarView"

export const html = new NodeTemplate(/*html*/`
	<div data-ref="sia-hide-plane"></div>
    <div id="sia-drawer-panel" class="container">
        <div id="sia-drawer-content" data-ref="sia-drawer-content" class="row">
            <div id="sia-content-wrapper"></div>
        </div>
    </div>
`)
// append views (would be nice to be able to directly embed nodetemplates)
html.ids["sia-content-wrapper"].appendChild(toolbarView.html.fragment)
html.ids["sia-content-wrapper"].appendChild(propertiesView.html.fragment)
html.ids["sia-content-wrapper"].appendChild(imageView.html.fragment)

export function show(){
	html.refs["sia-hide-plane"].style.display = "none"
}
export function hide(){
	html.refs["sia-hide-plane"].style.display = "block"
}
