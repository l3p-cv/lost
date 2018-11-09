import WizardTabPresenter from "wizard/WizardTabPresenter"

class ExampleWizardTab extends WizardTabPresenter {
    constructor(){
        super()
        // to acces the 'WizardTabView':
        // => this.view
    }
    
    // INSTRUCTION: override isValidated or extend validate!
    // /**
    //  * @override
    //  */
    // isValidated(){
    //     // ...
    //     return true
    // }
    
    // /**
    //  * @extend
    //  */
    // validate(){
    //     super.validate(()=>{
    //         // ...
    //         return true
    //     })
    // }
}
export default new ExampleWizardTab()