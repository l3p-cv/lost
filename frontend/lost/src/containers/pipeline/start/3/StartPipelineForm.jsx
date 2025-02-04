import { CCol, CRow } from '@coreui/react'
import { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { Form, FormGroup, Input, Label } from 'reactstrap'
import actions from '../../../../actions/pipeline/pipelineStart'
import HelpButton from '../../../../components/HelpButton'

const { nameOnInput, descriptionOnInput, verifyTab } = actions

const StartPipelineForm = ({
    name,
    description,
    nameOnInput,
    descriptionOnInput,
    verifyTab,
}) => {
    useEffect(() => {
        const verified = name && description
        verifyTab(2, verified)
    }, [name, description, verifyTab])

    const handleNameInput = useCallback(
        (e) => {
            nameOnInput(e.target.value)
        },
        [nameOnInput],
    )

    const handleDescriptionInput = useCallback(
        (e) => {
            descriptionOnInput(e.target.value)
        },
        [descriptionOnInput],
    )

    return (
        <>
            <CRow>
                <CCol sm="3"></CCol>
                <CCol sm="6">
                    <Form>
                        <FormGroup>
                            <Label for="name">Pipeline Name</Label>
                            <HelpButton
                                id={'pipeline-start-name'}
                                text={
                                    'Give your pipeline a name so that you can identify it later.'
                                }
                            />
                            <Input
                                value={name}
                                onChange={handleNameInput}
                                type="text"
                                name="name"
                                id="name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Pipeline Description</Label>
                            <HelpButton
                                id={'pipeline-start-desc'}
                                text={
                                    'Give your pipeline a description so that you still know later what you started it for.'
                                }
                            />
                            <Input
                                value={description}
                                onChange={handleDescriptionInput}
                                type="text"
                                name="description"
                                id="description"
                            />
                        </FormGroup>
                    </Form>
                </CCol>
                <CCol sm="3"></CCol>
            </CRow>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        name: state.pipelineStart.step2Data.name,
        description: state.pipelineStart.step2Data.description,
    }
}

export default connect(mapStateToProps, { nameOnInput, descriptionOnInput, verifyTab })(
    StartPipelineForm,
)
