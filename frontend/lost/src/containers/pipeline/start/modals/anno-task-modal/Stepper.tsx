import { useState } from 'react'
import { Button, Form, FormGroup, Input, Label, Progress } from 'reactstrap'
import { useStep } from '../../../../../hooks/useStep'

const StepOne = ({ formData, handleChange }) => (
    <Form>
        <h4 className="mb-3">Personal Information</h4>
        <FormGroup>
            <Label for="name">Name</Label>
            <Input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
            />
        </FormGroup>
    </Form>
)

const StepTwo = ({ formData, handleChange }) => (
    <Form>
        <h4 className="mb-3">Contact Details</h4>
        <FormGroup>
            <Label for="email">Email</Label>
            <Input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
            />
        </FormGroup>
    </Form>
)

const StepThree = ({ formData, handleChange }) => (
    <Form>
        <h4 className="mb-3">Security Information</h4>
        <FormGroup>
            <Label for="password">Password</Label>
            <Input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
            />
        </FormGroup>
    </Form>
)

const Stepper = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [
        currentStep,
        { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep },
    ] = useStep(3)

    const handleChange = (e) => {
        setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }))
    }

    const handleSubmit = () => {
        alert(JSON.stringify(formData))
    }

    const isStepComplete = () => {
        if (currentStep === 1) return formData.name.trim() !== ''
        if (currentStep === 2) return formData.email.trim() !== ''
        if (currentStep === 3) return formData.password.trim() !== ''
        return false
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne formData={formData} handleChange={handleChange} />
            case 2:
                return <StepTwo formData={formData} handleChange={handleChange} />
            case 3:
                return <StepThree formData={formData} handleChange={handleChange} />
            default:
                return null
        }
    }

    return (
        <div>
            <h3 className="text-center mb-2">Multi-Step Form</h3>
            <p className="text-center text-muted">Step {currentStep}/3</p>
            <Progress value={(currentStep / 3) * 100} className="mb-3" />
            {renderStep()}

            <div className="d-flex justify-content-between mt-3">
                {canGoToPrevStep && (
                    <Button color="secondary" onClick={goToPrevStep}>
                        Previous
                    </Button>
                )}

                <div className="ms-auto">
                    {canGoToNextStep && (
                        <Button
                            color="primary"
                            onClick={goToNextStep}
                            disabled={!isStepComplete()}
                        >
                            Next
                        </Button>
                    )}

                    {currentStep === 3 && (
                        <Button
                            color="success"
                            onClick={handleSubmit}
                            disabled={!isStepComplete()}
                        >
                            Submit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Stepper
