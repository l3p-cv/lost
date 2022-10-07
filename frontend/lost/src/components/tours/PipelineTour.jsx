import React, { useEffect } from 'react'
import { useTour } from '@reactour/tour'

const PipelineTour = ({ currentPipelineStep }) => {
    const { currentStep, setCurrentStep, setIsOpen, setSteps } = useTour()

    const steps = [
        {
            position: 'center',
            content: (
                <div>
                    <h1 className="mb-3">Pipeline-Guide</h1>
                    <p>You are visiting this page for the first time.</p>
                    <p>We want to show you how to create your first pipeline.</p>

                    <div className="mt-5">
                        <button
                            className="btn btn-danger mr-3"
                            onClick={() => setIsOpen(false)}
                        >
                            No I'm good
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => setCurrentStep(1)}
                        >
                            Sounds cool!
                        </button>
                    </div>
                </div>
            ),
        },
        {
            selector: '#selectPipelineStart',
            content: (
                <div>
                    <h2>Cool</h2>
                    <p>Then choose the sia pipeline and click "start".</p>
                </div>
            ),
        },
        {
            selector: '#pipelineGraph',
            position: 'left',
            content: (
                <div style={{ width: '200px' }}>
                    <h2>Pipeline-View</h2>
                    <p>Here you can see all steps of the SIA pipeline</p>
                    <p>All pipeline steps can be configured by clicking onto it</p>
                    <ul>
                        <li>Yellow boxed need to be configured in order to continue</li>
                        <li>Green boxes may but dont need to be configured</li>
                    </ul>
                    <button
                        className="btn btn-success"
                        style={{ float: 'right' }}
                        onClick={() => setCurrentStep(3)}
                    >
                        Go on!
                    </button>
                </div>
            ),
        },
        {
            selector: '#pipelineGraph',
            content: 'Start by selecting a datasource',
        },
        {
            selector: '.modal-content',
            position: 'left',
            resizeObservables: ['.modal-content'],
            mutationObservables: ['.modal-content'],
            content: (
                <div>
                    <p>Here you can select the origin of your images.</p>
                    <p>For now you can continue using the exaple image set.</p>
                    <li>Select a Datasource at the top left selection box</li>
                    <li>
                        Select the folder containing the annotation images (e.g.{' '}
                        <kbd>media/images/10_voc2010</kbd>)
                    </li>
                    <li>
                        Single click the destination folder and click <kbd>Okay</kbd>
                    </li>

                    <button
                        className="btn btn-success"
                        style={{ float: 'right' }}
                        onClick={() => setCurrentStep(5)}
                    >
                        Done
                    </button>
                </div>
            ),
        },
        {
            selector: '#pipelineGraph',
            content: (
                <>
                    <h2>Nice!</h2>
                    <p>Now you can configure the annotation task</p>
                </>
            ),
        },
        {
            selector: '.modal-content',
            position: 'left',
            resizeObservables: ['.modal-content'],
            mutationObservables: ['.modal-content'],
            content: 'Hier siehst du wieviel du annotiert hast',
        },
    ]

    const listenForDatasourceClick = () => {
        // not the best way in general but the best without modifying other components
        document.getElementById('dataSourceNode').addEventListener('click', () => {
            setCurrentStep(4)
        })
    }

    const listenForAnnotationtaskClick = () => {
        // not the best way in general but the best without modifying other components
        // the current document is not available here
        // @TODO: find a click listener alternative
        // document.getElementById('annoTaskNode').addEventListener('click', () => {
        //     setCurrentStep(6)
        // })
    }

    useEffect(() => {
        setSteps(steps)

        // wait until table is rendered to get right size
        window.setTimeout(() => {
            setIsOpen(true)
        }, 500)
    }, [])

    useEffect(() => {
        if (currentPipelineStep !== 1) return

        setCurrentStep(2)

        listenForDatasourceClick()
    }, [currentPipelineStep])

    useEffect(() => {
        console.info(currentStep)

        if (currentStep === 5) listenForAnnotationtaskClick()
    }, [currentStep])
}

export default PipelineTour
