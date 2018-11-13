import * as appPresenter from "./appPresenter"

window.APP = window.APP || {}
window.APP.init = (params) => {
    appPresenter.init(params)
}
