import DrawablePresenter from "../DrawablePresenter"
import MenuPresenter from "../menu/MenuPresenter"

import PointModel from "./PointModel"
import PointView from "./PointView"

import imageInterface from "components/image/imageInterface"


export default class PointPresenter extends DrawablePresenter {
    constructor(annotationData: any){
        let model = new PointModel(annotationData)
        let view = new PointView({
            label: model.label.name, 
            position: model.actBounds.value, 
            isNoAnnotation: annotationData.isNoAnnotation,
        })
        super(model, view)
        this.menuBar = new MenuPresenter({
            drawable: this,
            mountPoint: this.view.html.refs["container-node"],
            display: {
                label: annotationData.isNoAnnotation ? false : true,
                bar: false,
            },
            label: {
                text: this.model.label.name,
            },
        })
    }

    onHover(){
        this.view.hover()
        this.menuBar.hover()
    }
    onUnhover(){
        this.view.unhover()
        this.menuBar.unhover()
    }
    onSelect(){
        this.view.select(this.isChangable())
        this.menuBar.select()
    }
    onUnselect(){
        this.view.unselect()
        this.menuBar.unselect()
    }
    
    // @required-extensible
    resize(){
        super.resize(imageDimensions => {
            const { imgW, imgH } = imageDimensions
            const pos = {
                x: this.model.relBounds.x * imgW,
                y: this.model.relBounds.y * imgH,
            }
            this.setPosition(pos)
        })
    }

    setPosition(coord: any){
        const { imgW, imgH } = imageInterface.getDimensions()
        coord = this.model.validate(coord, {
            min: {
                x: 0,
                y: 0,
            },
            max: {
                x: imgW,
                y: imgH,
            },
        })
        this.view.setPosition(coord)
        this.model.updateBounds(coord)
    }
    move(distance: any){
        let { x, y } = distance
        x = x ? x : 0
        y = y ? y : 0
        this.setPosition({
            x: this.getX() + x,
            y: this.getY() + y,
        })
    }

    getX(){
        return this.model.actBounds.value.x
    }
    getY(){
        return this.model.actBounds.value.y
    }
    getCoord(){
        return {
            x: this.getX(),
            y: this.getY(),
        }
    }
    getBounds(){
        return this.getCoord()
    }
}
