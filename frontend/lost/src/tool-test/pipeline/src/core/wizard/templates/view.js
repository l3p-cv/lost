import WizardTabView from "wizard/WizardTabView"

class ExampleWizardTabView extends WizardTabView {
    constructor(){
        // the config object can be declared outside
        // of the class or directly into the super call aswell.
        super({
            title: "give a title",
            icon: "give an icon string",
            content: `
                <h1>write html content</h1>
            `,
        })
    }
    // ... dom manipulating methods ...
    // to acces the content use the 'NodeTemplate':
    // => this.html
}
export default new ExampleWizardTabView()