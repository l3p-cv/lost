import "./wizard.scss"

import $ from "jquery"

import { NodeTemplate, iterate } from "l3p-frontend"

const panePrefix    = "wizard-pane-"
const wizardPrefix  = "wizard-"
let wizardCount     = 0

function containsElementWithId(node: Node, id: string){
    iterate(node, (n) => {
        if(n.getAttribute("id") === id) return true
    })
}

class Wizard {
    /**
     * 
     * @param {*} id ID of the DOM node or the DOM node reference where the wizard should be mounted at.
     */
    constructor(mountPoint: Node | String) {
        let id = undefined
        switch(typeof(mountPoint)){
            case "string":
                id = mountPoint
                mountPoint = document.getElementById(id)    
                break
            case "object":
                if (mountPoint.nodeType !== Node.ELEMENT_NODE) {
                    throw new Error("mountPoint has invalid type, use 'string' or 'Node'")
                }
                // get id if exists, else add id
                const mpId = mountPoint.getAttribute("id")
                id = (mpId !== "") 
                    ? mpId 
                    : (wizardPrefix + wizardCount) 

                wizardCount++
                break
            default: throw new Error("mountPoint has invalid type, use 'string' or 'Node'")
        }
        
        // define unique ids for core elements and expose them 
        this.wizardId           = `${id}-wizard`
        this.navContainerId     = `${id}-wizard-navs`
        this.paneContainerId    = `${id}-wizard-panes`

        // check if wizard exists
        if(containsElementWithId(mountPoint, this.wizardId)){
            throw new Error("a wizard is allready mounted at this position.")
        }

        // create wizard core html code
        this.html = new NodeTemplate(`
            <div class="wizard" id="${this.wizardId}">
                
                <div class="wizard-inner">
                <ul class="nav nav-tabs" id="${this.navContainerId}">
                    <div class="connecting-line"></div>
                        <!-- navigation gets generated when adding a pane -->
                    </ul>
                </div>
                
                <div class="tab-content" id="${this.paneContainerId}">
                    <!-- tab panes get added here -->
                </div>
        
            </div>
        `)
        mountPoint.appendChild(this.html.fragment)

        // array to hold 'WizardTab' references
        this.tabs = [] 
        this.currentTab = undefined

        // expose the container node references (not used by now)
        this.navContainer = this.html.ids[this.navContainerId]
        this.paneContainer = this.html.ids[this.paneContainerId]
    }
    add(tab: WizardTabPresenter | Array<WizardTabPresenter>) {
        const id = panePrefix + this.tabs.length
        // bulk process add multiple tabs at once
        if(Array.isArray(tab)) {
            tab.forEach(t => this.add(t))
            return
        }

        // @move out?
        // setup tab nav usage validation
        $(tab.view.nav.root).on("mouseover", (e) => {
            if(tab !== this.currentTab){
                const unlocked = tab.isUnlocked()
                if(unlocked && !tab.isEnabled){
                    tab.enable()
                } 
                else if(!unlocked) {
                    tab.disable()
                }
            }
        })
        // @move out?
        // setup tab toggling
        $(tab.view.nav.refs["a"]).on("click", (e) => {
            if(tab !== this.currentTab){
                if(tab.isUnlocked()){
                    // deactivate last tab 
                    if(this.currentTab !== undefined){
                        this.currentTab.deactivate()
                    }
                    // activate this tab
                    tab.activate()
                    this.currentTab = tab
                    /**
                     * @todo: change scrollIntoView parameter 
                     * depending on browser.
                     * opera doesnt support it at all. 
                     * only firefox and chrome support behaviour:smooth
                     * - scrollIntoView({block: "start", behavior: "smooth"});
                     * - scrollIntoView(true);
                     */
                    this.html.root.scrollIntoView(true)
                }
            }
        })
        
        // append the nodes to the wizard
        this.navContainer.appendChild(tab.view.nav.fragment)
        this.paneContainer.appendChild(tab.view.pane.fragment)
        
        // the first added tab gets activated
        if(this.tabs.length === 0){
            tab.show()
        }
        this.tabs.push(tab)
    }
}

export default Wizard