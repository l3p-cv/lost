import appModel from "./appModel"
import * as data from "pipRoot/core/data"
import * as appPresenter from "./appPresenter"

window.APP = window.APP || {}
window.APP.init = (params) => {
    appPresenter.init(params)
}
