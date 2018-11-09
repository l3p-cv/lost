/**
 * ABOUT THE MVP HERE:
 * 
 * MODEL BINDING NOT FOR LOWLEVEL DATA LIKE isActivated...
 * Should be better. No need for a complex 'Observable'...
 * 
 * MODEL BINDING FOR HIGHLEVEL DATA LIKE TABLE-DATA O.E.
 * As this is a component, it will use (bind [view to]) the 'AppModel'  
 * 
 */
import WizardTabView from "./WizardTabView"
import EVENTS from "./WizardEvents"
// import { prototype } from "l3p-frontend"

export default class WizardTabPresenter {

    constructor(){
        // create internal control logic datastructure
        this.requirements = []
        this.activationHooks = {
            before: [],
            after: [],
        }
        this.isEnabled = undefined
        this.isActive = undefined
    }

    /**
     * Used to add dependencys 
     * @param {*} tab a 'WizardTab' or Array of 
     */
    requiresValid(tab: WizardTabPresenter | Array<WizardTabPresenter>){
        if(Array.isArray(tab)){
            tab.forEach(t => this.requirements.push(t))
        } else {
            this.requirements.push(tab)
        }
    }

    /**
     * can be overridden instead of extending validate
     */
    isValidated(){
        return true
    }
    
    /**
     * validate method can get extended with a callback,
     * that returns if the content is validated or not (bool).
     * @return true as default
     */
    validate(cb: Function){
        return (cb !== undefined && typeof(cb) === "function")
            ? cb()
            : true
    }

    // @external
    on(event: String | Array<String>, cb: Function){
        switch(event){
            case "before-activate":
                if(this.activationHooks.before.find(f => cb.equals(f)) === undefined){
                    this.activationHooks.before.push(cb)
                }
                break
            case "after-activate":
                if(this.activationHooks.after.find(f => cb.equals(f)) === undefined){
                    this.activationHooks.after.push(cb)
                }
                break
            default: 
                throw new Error(`event name "${event}" is invalid.  ${EVENTS.join(", ")}`)
        }
    }

    /**
     * @todo: is toggling via click() fine?
     */
    // @external
    show(){
        this.view.nav.refs["a"].click()

    }

    // @internal
    isUnlocked(){
        return this.requirements.every(t => t.isValidated())
    }
    // @internal
    isLocked(){
        return !this.isUnlocked()
    }
    // @internal
    enable(){
        // if(this.isUnlocked() && !this.isEnabled){
        this.view.enable()
        this.isEnabled = true
        // } 
    }
    // @internal
    disable(){
        // if(this.isLocked()){
        this.view.disable()
        this.isEnabled = false
        // }
    }

    /**
     * @todo: if this method is called manually it wont work properly.
     * there u cant deactivate the previous activated tab from here.
     * hence dont use this method (how to hide it?) 
     * use the click event instead.
     * @todo: maybe add typecheck function? bstprctis?
     * @param {*} hook 
     */
    // @external
    activate(){
        if(this.isUnlocked() && !this.isActive){            
            // run before activation hook
            if(this.activationHooks.before.length > 0){
                this.activationHooks.before.forEach(f => f())
            }
            this.view.activate()
            this.isActive = true

            // run after activation hook
            if(this.activationHooks.after.length > 0){
                this.activationHooks.after.forEach(f => f())
            }
        } 
    }
    // @internal?
    deactivate(cb: Function){
        this.view.deactivate()
        if(cb !== undefined && typeof cb === "function"){
            cb()
        }
        this.isActive = false
    }
}

// function isUnlocked(instance: WizardTabPresenter){
//     return instance.requirements.every(t => t.isValidated())
// }
// function isLocked(instance: WizardTabPresenter){
//     return !isUnlocked(instance)
// }

