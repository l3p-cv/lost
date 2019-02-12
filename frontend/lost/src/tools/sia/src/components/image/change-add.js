import { STATE } from "drawables/drawable.statics"

import * as imageView from "./imageView"

export function addDrawable(drawable: DrawablePresenter){
    if(!drawable.model.status.has(STATE.DELETED)){
        imageView.addDrawable(drawable)
    }
}