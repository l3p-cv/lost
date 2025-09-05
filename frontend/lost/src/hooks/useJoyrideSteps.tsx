import { useEffect, useState } from 'react'
import { FaAngleDoubleRight } from 'react-icons/fa'
import { Step } from 'react-joyride'
import { useLocation } from 'react-router-dom';

export const useJoyrideSteps = (
    templateType: string,
    latestPipelineId?: number,
): Step[] => {
    const location = useLocation(); 
    const currentPath = location.pathname;   
    const mainPipelineSteps: Step[] = [
        {
            // 0
            target: '#nav-start-pipeline',
            title: 'Start Pipeline',
            content: 'Click here to begin setting up a new pipeline.',
            placement: 'right',
            disableBeacon: true,
            spotlightClicks: false,
        },
        {
            // 1
            target: '.pipeline-start-1',
            title: 'Pipeline Templates',
            content: 'These are the available pipeline templates.',
            placement: 'top',
            spotlightClicks: false,
        },
        {
            // 2
            target: '.sia-start-button',
            title: 'Start SIA Pipeline using a Template',
            content: 'Click "Next" to open this template.',
            placement: 'right',
            spotlightClicks: false,
        },
        {
            // 3
            target: `.react-flow__node-datasourceNode[data-id="0"]`,
            title: 'Datasource Node',
            content: 'Start by configuring your datasource.',
            placement: 'top',
            spotlightClicks: false,
        },
        {
            // 4
            target: '#datasource-modal',
            title: 'Datasource Modal',
            content: 'This is where you configure your datasource.',
            placement: 'right',
            spotlightClicks: false,
        },
        {
            // 5
            target: '#datasource-dropdown',
            title: 'Datasource Dropdown',
            content: 'Click to select a datasource.',
            placement: 'top',
            spotlightClicks: true,
        },
        {
            // 6
            target: '#datasource-dropdown .dropdown-menu.show',
            title: 'Select a Datasource',
            content: 'Now select a datasource from the list.',
            placement: 'top',
            spotlightClicks: true,
        },
        {
            // 7
            target: '#file-browser-container',
            title: 'Choose Media Folder',
            content:
                'Upload files using the upload box above, then browse and select the folder as input.',
            placement: 'top',
            spotlightClicks: true,
        },
        {
            // 8
            target: '#selected-datasource-path',
            title: 'Selected Path',
            content: 'Here is the path you selected.',
            placement: 'bottom',
            spotlightClicks: false,
            disableOverlay: true,
        },
        {
            // 9
            target: '#done-button',
            title: 'Done',
            content: 'Click "Done" to finalize your Datasource configuration.',
            placement: 'bottom',
            spotlightClicks: false,
            disableOverlay: true,
        },
        {
            // 10
            target: `.react-flow__node.script-node`,
            title: 'Script Node',
            content: 'This script is already configured. Click "Next" to continue.',
            placement: 'top',
            spotlightClicks: false,
            disableBeacon: true,
        },
        {
            // 11
            target: `.react-flow__node.anno-task-node`,
            title: 'Annotation Node',
            content: 'Click to configure the annotation task.',
            placement: 'top',
            spotlightClicks: false,
            disableBeacon: true,
        },
        {
            // 12
            target: '#name',
            title: 'Annotation Task Name',
            content: 'Give your annotation task a clear and descriptive name.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 13
            target: '#instruction',
            title: 'Instructions (Optional)',
            content:
                'Optionally, provide instructions to help annotators understand the task.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 14
            target: '.step1next',
            title: 'Continue to Next Step',
            content: 'Click "Next" to continue after filling out task details.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 15
            target: '#userSelect',
            title: 'User or Group Selection',
            content: 'Select a user or group to assign this annotation task.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 16
            target: '.step2next',
            title: 'Continue to Next Step',
            content: 'Click "Next" to continue after selecting the user.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 17
            target: '#treeSelect',
            title: 'Label Tree Selection',
            content:
                'Select a label tree to categorize your annotations. You will be able to select labels in the next step.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 18
            target: '.step3next',
            title: 'Continue to Next Step',
            content: 'Click "Next" to continue after selecting the label tree.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 19
            target: '#select-label-container',
            title: 'Label Selection',
            content:
                'Select one or more labels to include in your annotation task. You can activate entire branches by clicking parent nodes.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 20
            target: '.step4next',
            title: 'Continue',
            content: 'Click "Next" after selecting your labels.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 21
            target: '#select-storage-container',
            title: 'Dataset Selection',
            content:
                'Choose a dataset where the annotations for this task will be stored. You can also create a new one if needed.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 22
            target: '.step5next',
            title: 'Continue to Next Step',
            content: 'Click "Next" to continue after selecting or creating a dataset.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 23
            target: '#sia-configuration-heading',
            content: 'This section lets you configure SIA annotation tools and actions.',
            disableBeacon: true,
            placement: 'right',
            spotlightClicks: true,
        },
        {
            // 24
            target: '.steplast',
            content: 'Click this button to finish the configuration process.',
            disableBeacon: true,
            placement: 'top',
            spotlightClicks: true,
        },
        {
            // 25
            target: '.step-template-next',
            title: 'Next Step',
            content:
                'Click this "Next" button to proceed to the next step of configuring your pipeline template.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 26
            target: '.start-pipeline-modal',
            title: 'Pipeline Name',
            content: 'Enter a name for your pipeline so you can identify it later.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 27
            target: '#description',
            title: 'Pipeline Description',
            content: 'Add a description to remember the purpose of this pipeline.',
            placement: 'right',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 28
            target: '.start-pipeline-btn',
            title: 'Launch Your Pipeline',
            content: 'Click here to start your configured pipeline.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            // 29
            target: '.latest-pipeline-row',
            title: 'Latest Created Pipeline',
            content:
                'This is the pipeline you created. The pipeline execution is being initialized and might take a few seconds. Please wait before clicking "Next" to continue to Annotation.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
        {
            target: '.first-row-class',
            title: 'Latest Annotation Task',
            content: 'This is your most recently created annotation task.',
            placement: 'top',
            spotlightClicks: true,
            disableBeacon: true,
        },
    ]

    if (templateType === 'mainPipeline') {
        return mainPipelineSteps
    }

    if (templateType === 'miaPipeline') {
        const miaPipelineSteps: Step[] = [
            {
                target: '#nav-start-pipeline',
                title: 'Start Pipeline',
                content: 'Click here to begin setting up a new pipeline.',
                placement: 'right',
                disableBeacon: true,
                spotlightClicks: false,
            },
            {
                target: '.pipeline-start-1',
                title: 'Pipeline Templates',
                content: 'These are the available pipeline templates.',
                placement: 'top',
                spotlightClicks: false,
            },
            {
                target: '.mia-start-button',
                title: 'Start MIA Pipeline using a Template',
                content: 'Click "Next" to open this template.',
                placement: 'right',
                spotlightClicks: false,
            },
            {
                target: `.react-flow__node-datasourceNode[data-id="0"]`,
                title: 'Datasource Node',
                content: 'Start by configuring your datasource node for MIA pipeline.',
                placement: 'top',
                spotlightClicks: false,
            },
            {
                target: '#datasource-modal',
                title: 'Datasource Modal',
                content: 'This is where you configure your datasource.',
                placement: 'right',
                spotlightClicks: false,
            },
            {
                target: '#datasource-dropdown',
                title: 'Datasource Dropdown',
                content: 'Click to select a datasource.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                target: '#datasource-dropdown .dropdown-menu.show',
                title: 'Select a Datasource',
                content: 'Now select a datasource from the list.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                target: '#file-browser-container',
                title: 'Choose Media Folder',
                content:
                    'Upload files using the upload box above, then browse and select the folder as input.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                target: '#selected-datasource-path',
                title: 'Selected Path',
                content: 'Here is the path you selected.',
                placement: 'bottom',
                spotlightClicks: false,
            },
            {
                target: '#done-button',
                title: 'Done',
                content: 'Click "Done" to finalize your Datasource configuration.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                target: `.react-flow__node.script-node`,
                title: 'Script Node',
                content: 'This script is already configured. Click "Next" to continue.',
                placement: 'top',
                spotlightClicks: false,
                disableBeacon: true,
            },
            {
                target: `.react-flow__node.anno-task-node`,
                title: 'Annotation Task Node',
                content: 'Click to configure your annotation task for MIA pipeline.',
                placement: 'top',
                spotlightClicks: false,
                disableBeacon: true,
            },
            {
                target: '#name',
                title: 'Annotation Task Name',
                content: 'Provide a descriptive name for your annotation task.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#instruction',
                title: 'Instructions (Optional)',
                content: 'Optionally, provide instructions for annotators.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.step1next',
                title: 'Continue to Next Step',
                content: 'Click "Next" to continue after filling out task details.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#userSelect',
                title: 'User or Group Selection',
                content: 'Assign a user or group to this annotation task.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.step2next',
                title: 'Continue to Next Step',
                content: 'Click "Next" to continue after selecting the user.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#treeSelect',
                title: 'Label Tree Selection',
                content: 'Select a label tree to categorize annotations.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.step3next',
                title: 'Continue to Next Step',
                content: 'Click "Next" after selecting the label tree.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#select-label-container',
                title: 'Label Selection',
                content: 'Select one or more labels for the annotation task.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.step4next',
                title: 'Continue',
                content: 'Click "Next" after selecting your labels.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#select-storage-container',
                title: 'Dataset Selection',
                content: 'Choose or create a dataset to store annotations.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.step5next',
                title: 'Continue to Next Step',
                content:
                    'Click "Next" to continue after selecting or creating a dataset.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#mia-configuration-heading',
                content: 'Configure MIA-specific annotation tools and actions here.',
                disableBeacon: true,
                placement: 'right',
                spotlightClicks: true,
            },
            {
                target: '.steplast',
                content: 'Click this button to finish the configuration process.',
                disableBeacon: true,
                placement: 'top',
                spotlightClicks: true,
            },
            {
                target: '.step-template-next',
                title: 'Next Step',
                content:
                    'Click this "Next" button to proceed with your MIA pipeline template.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.start-pipeline-modal',
                title: 'Pipeline Name',
                content: 'Enter a name for your MIA pipeline.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '#description',
                title: 'Pipeline Description',
                content: 'Optionally add a description for your pipeline.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.start-pipeline-btn',
                title: 'Launch Your Pipeline',
                content: 'Click here to start your configured MIA pipeline.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.latest-pipeline-row',
                title: 'Latest Created Pipeline',
                content:
                    'This is the pipeline you created. The pipeline execution is being initialized and might take a few seconds. Please wait before clicking "Next" to continue to Annotation.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                target: '.first-row-class',
                title: 'Latest Annotation Task',
                content:
                    'This is your most recently created annotation task for the pipeline.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
        ]

        return miaPipelineSteps
    }
    if (templateType === 'instructionTour' && latestPipelineId == undefined) {
        const instructionTourSteps: Step[] = []
            if (currentPath !== '/instructions') {
                instructionTourSteps.push({
                    target: '#nav-instruction',
                    title: 'Instructions Tab',
                    content: 'Click here to view instructions for annotators.',
                    placement: 'right',
                    disableBeacon: true,
                    spotlightClicks: true,
                }
            );
            }
            instructionTourSteps.push(
                {
                // 0
                target: '.add-instruction-button',
                title: 'Add Instruction',
                content: 'Click here to start creating a new instruction.',
                placement: 'right',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 1
                target: '.annotation-option-input',
                title: 'Enter Annotation Option',
                content: 'Enter the Title of your Instruction.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 2
                target: '.description-input',
                title: 'Enter Description',
                content: 'Provide a description for the instruction.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 3
                target: '#instruction-editor',
                title: 'Add Instructions',
                content: 'Write your instructions here using the editor.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 4
                target: '.browse-files-button',
                title: 'Browse Files to Add Images',
                content:
                    'Click to browse and select images to include in your instructions.',
                placement: 'right',
                spotlightClicks: true,
            },
            {
                // 5
                target: '.file-browser-modal',
                title: 'Browse Files to Add Images',
                content: 'Browse and select images to include in your instructions.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 6
                target: '.save-button',
                title: 'Save Instruction',
                content: 'Click to save your instruction.',
                placement: 'right',
                spotlightClicks: true,
            },
            {
                // 7
                target: '.instruction-list',
                title: 'View Instructions',
                content: (
                    <div>
                        Your newly created instruction will appear at the end of this
                        list. Click the{' '}
                        <FaAngleDoubleRight
                            style={{ display: 'inline', margin: '0 4px' }}
                        />{' '}
                        button below to proceed.
                    </div>
                ),
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 8
                target: '.last-row-highlight',
                title: 'New Instruction Row',
                content: 'This is your new instruction row.',
                placement: 'top',
                spotlightClicks: false,
            },
            {
                // 9
                target: '.edit-instruction-button',
                title: 'Edit Instruction',
                content: 'Click to edit your new instruction.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                // 10
                target: '.edit-instructions-modal',
                content:
                    'Here you can edit the instruction details. Make changes and save when done.',
                placement: 'top',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 11
                target: '.save-button',
                title: 'Save Instruction',
                content: 'Click to save your instruction.',
                placement: 'right',
                spotlightClicks: true,
            },            
            {
                // 12
                target: '#nav-start-pipeline',
                title: 'Start Pipelines Tab',
                content:
                    'Click here to navigate to the Pipeline Templates page to start an SIA pipeline.',
                placement: 'right',
                disableBeacon: true,
                spotlightClicks: false,
            },
            {
                // 13
                target: '.pipeline-start-1',
                title: 'Pipeline Templates',
                content:
                    'These are the available pipeline templates to start your SIA pipeline.',
                placement: 'top',
                spotlightClicks: false,
            },
            {
                // 14
                target: '.sia-start-button',
                title: 'Start SIA Pipeline',
                content: 'Click this button to open the SIA pipeline template.',
                placement: 'right',
                spotlightClicks: false,
            },
            {
                // 16
                target: `.react-flow__node-datasourceNode[data-id="0"]`,
                title: 'Datasource Node',
                content: 'Start by configuring your datasource.',
                placement: 'top',
                spotlightClicks: false,
            },
            {
                // 17
                target: '#datasource-modal',
                title: 'Datasource Modal',
                content: 'This is where you configure your datasource.',
                placement: 'right',
                spotlightClicks: false,
            },
            {
                // 18
                target: '#datasource-dropdown',
                title: 'Datasource Dropdown',
                content: 'Click to select a datasource.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 19
                target: '#datasource-dropdown .dropdown-menu.show',
                title: 'Select a Datasource',
                content: 'Now select a datasource from the list.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 20
                target: '#file-browser-container',
                title: 'Choose Media Folder',
                content:
                    'Upload files using the upload box above, then browse and select the folder as input.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 21
                target: '#selected-datasource-path',
                title: 'Selected Path',
                content: 'Here is the path you selected.',
                placement: 'bottom',
                spotlightClicks: false,
            },
            {
                // 22
                target: '#done-button',
                title: 'Done',
                content: 'Click "Done" to finalize your Datasource configuration.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                // 23
                target: `.react-flow__node.script-node`,
                title: 'Script Node',
                content: 'This script is already configured. Click "Next" to continue.',
                placement: 'top',
                spotlightClicks: false,
                disableBeacon: true,
            },
            {
                // 24
                target: `.react-flow__node.anno-task-node`,
                title: 'Annotation Node',
                content: 'Click to configure the annotation task.',
                placement: 'top',
                spotlightClicks: false,
                disableBeacon: true,
            },
            {
                // 25
                target: '#name',
                title: 'Annotation Task Name',
                content: 'Give your annotation task a clear and descriptive name.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 26
                target: '#instruction',
                title: 'Select Your Instructions',
                content:
                    'Select the instructions you created earlier to guide annotators. These instructions, including text and images, ensure annotators understand the task requirements clearly.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 27
                target: '.step1next',
                title: 'Continue to Next Step',
                content: 'Click "Next" to continue after filling out task details.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 28
                target: '#userSelect',
                title: 'User or Group Selection',
                content: 'Select a user or group to assign this annotation task.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 29
                target: '.step2next',
                title: 'Continue to Next Step',
                content: 'Click "Next" to continue after selecting the user.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 30
                target: '#treeSelect',
                title: 'Label Tree Selection',
                content:
                    'Select a label tree to categorize your annotations. You will be able to select labels in the next step.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 31
                target: '.step3next',
                title: 'Continue to Next Step',
                content: 'Click "Next" to continue after selecting the label tree.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 32
                target: '#select-label-container',
                title: 'Label Selection',
                content:
                    'Select one or more labels to include in your annotation task. You can activate entire branches by clicking parent nodes.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 33
                target: '.step4next',
                title: 'Continue',
                content: 'Click "Next" after selecting your labels.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 34
                target: '#select-storage-container',
                title: 'Dataset Selection',
                content:
                    'Choose a dataset where the annotations for this task will be stored. You can also create a new one if needed.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 35
                target: '.step5next',
                title: 'Continue to Next Step',
                content:
                    'Click "Next" to continue after selecting or creating a dataset.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 36
                target: '#sia-configuration-heading',
                content:
                    'This section lets you configure SIA annotation tools and actions.',
                disableBeacon: true,
                placement: 'right',
                spotlightClicks: true,
            },
            {
                // 37
                target: '.steplast',
                content: 'Click this button to finish the configuration process.',
                disableBeacon: true,
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 38
                target: '.step-template-next',
                title: 'Next Step',
                content:
                    'Click this "Next" button to proceed to the next step of configuring your pipeline template.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 39
                target: '.start-pipeline-modal',
                title: 'Pipeline Name',
                content: 'Enter a name for your pipeline so you can identify it later.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 40
                target: '#description',
                title: 'Pipeline Description',
                content: 'Add a description to remember the purpose of this pipeline.',
                placement: 'right',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 41
                target: '.start-pipeline-btn',
                title: 'Launch Your Pipeline',
                content: 'Click here to start your configured pipeline.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 42
                target: '.latest-pipeline-open-button',
                title: 'Open Latest Pipeline',
                content: 'Click this button to view the latest created pipeline.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 43
                target: '.react-flow__node.react-flow__node-annoTaskNode',
                title: 'Edit Instructions',
                content: 'To edit instructions in your pipeline, click next.',
                placement: 'top',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 44
                target: '.inactive-tab-class',
                title: 'Switch Tab',
                content: 'Click this tab to switch to the final instruction step.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 45
                target: '.instruction-tab',
                title: 'Instruction Options Tab',
                content:
                    'Here you can "View" and "Edit" the instruction options. Make changes and "Save" when done.',
                placement: 'top',
                spotlightClicks: true,
                disableBeacon: true,
            },
            )
        return instructionTourSteps
    } else if (templateType === 'instructionTour' && latestPipelineId) {
                const instructionTourSteps: Step[] = []
            if (currentPath !== '/instructions') {
                instructionTourSteps.push({
                    target: '#nav-instruction',
                    title: 'Instructions Tab',
                    content: 'Click here to view instructions for annotators.',
                    placement: 'right',
                    disableBeacon: true,
                    spotlightClicks: true,
                }
            );
            }
            instructionTourSteps.push(

                    {
                    // 0
                    target: '.add-instruction-button',
                    title: 'Add Instruction',
                    content: 'Click here to start creating a new instruction.',
                    placement: 'right',
                    disableBeacon: true,
                    spotlightClicks: true,
                },
                {
                    // 1
                    target: '.annotation-option-input',
                    title: 'Enter Annotation Option',
                    content: 'Enter the Title of your Instruction.',
                    placement: 'top',
                    spotlightClicks: true,
                },
                {
                    // 2
                    target: '.description-input',
                    title: 'Enter Description',
                    content: 'Provide a description for the instruction.',
                    placement: 'top',
                    spotlightClicks: true,
                },
                {
                    // 3
                    target: '#instruction-editor',
                    title: 'Add Instructions',
                    content: 'Write your instructions here using the editor.',
                    placement: 'top',
                    spotlightClicks: true,
                },
                {
                    // 4
                    target: '.browse-files-button',
                    title: 'Browse Files to Add Images',
                    content:
                        'Click to browse and select images to include in your instructions.',
                    placement: 'right',
                    spotlightClicks: true,
                },
                {
                    // 5
                    target: '.file-browser-modal',
                    title: 'Browse Files to Add Images',
                    content: 'Browse and select images to include in your instructions.',
                    placement: 'top',
                    spotlightClicks: true,
                },
                {
                    // 6
                    target: '.save-button',
                    title: 'Save Instruction',
                    content: 'Click to save your instruction.',
                    placement: 'right',
                    spotlightClicks: true,
                },
                {
                    // 7
                    target: '.instruction-list',
                    title: 'View Instructions',
                    content: (
                        <div>
                            Your newly created instruction will appear at the end of this
                            list. Click the{' '}
                            <FaAngleDoubleRight
                                style={{ display: 'inline', margin: '0 4px' }}
                            />{' '}
                            button below to proceed.
                        </div>
                    ),
                    placement: 'top',
                    spotlightClicks: true,
                },
                {
                    // 8
                    target: '.last-row-highlight',
                    title: 'New Instruction Row',
                    content: 'This is your new instruction row.',
                    placement: 'top',
                    spotlightClicks: false,
                },
                {
                    // 9
                    target: '.edit-instruction-button',
                    title: 'Edit Instruction',
                    content: 'Click to edit your new instruction.',
                    placement: 'bottom',
                    spotlightClicks: true,
                },
                {
                    // 10
                    target: '.edit-instructions-modal',
                    content:
                        'Here you can edit the instruction details. Make changes and save when done.',
                    placement: 'top',
                    disableBeacon: true,
                    spotlightClicks: true,
                },
                {
                    // 11
                    target: '.save-button',
                    title: 'Save Instruction',
                    content: 'Click to save your instruction.',
                    placement: 'right',
                    spotlightClicks: true,
                },
                {
                    // 12
                    target: '#nav-pipelines',
                    title: 'Pipelines Tab',
                    content:
                        'Click here to navigate to the Pipelines page to start an SIA pipeline.',
                    placement: 'right',
                    disableBeacon: true,
                    spotlightClicks: false,
                },
                {
                    // 13
                    target: '.latest-pipeline-open-button',
                    title: 'Open Latest Pipeline',
                    content: 'Click this button to view the latest created pipeline.',
                    placement: 'top',
                    spotlightClicks: true,
                    disableBeacon: true,
                },
                {
                    // 14
                    target: '.react-flow__node.react-flow__node-annoTaskNode',
                    title: 'Edit Instructions',
                    content: 'To edit instructions in your pipeline, click next.',
                    placement: 'top',
                    disableBeacon: false,
                    spotlightClicks: true,
                },
                {
                    // 15
                    target: '.inactive-tab-class',
                    title: 'Switch Tab',
                    content: 'Click this tab to switch to the final instruction step.',
                    placement: 'top',
                    spotlightClicks: true,
                    disableBeacon: true,
                },
                {
                    // 16
                    target: '.instruction-tab',
                    title: 'Instruction Options Tab',
                    content:
                        'Here you can "View" and "Edit" the instruction options. Make changes and "Save" when done.',
                    placement: 'top',
                    spotlightClicks: true,
                    disableBeacon: true,
                },
            )
        return instructionTourSteps
    }
    if (templateType === 'labelTour') {
        const labelTourSteps: Step[] = [
            {
                // 0
                target: '#nav-labels',
                title: 'Labels Tab',
                content: 'Click here to manage and create your label trees.',
                placement: 'right',
                disableBeacon: true,
                spotlightClicks: false,
            },
            {
                // 1
                target: '.treeName',
                title: 'Name Your Tree',
                content: 'Type a name for your label tree. For example, "Fruits".',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 2
                target: '.treeDesc',
                title: 'Describe Your Tree',
                content: 'Add a short description, like "Different kinds of fruits".',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 3
                target: '.treeAdd',
                title: 'Create the Tree',
                content: 'Click here to make your label tree.',
                placement: 'left',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 4
                target: '.latestLabelTree',
                title: 'See Your Tree',
                content: 'This shows the tree you just made.',
                placement: 'top',
                spotlightClicks: false,
                disableBeacon: true,
            },
            {
                // 5
                target: '.latest-edit-button',
                title: 'Edit Your Tree',
                content: 'Click here to open and edit the label tree you created.',
                placement: 'left',
                spotlightClicks: true,
                disableBeacon: true,
            },
            {
                // 6
                target: '.label-node.root-node',
                title: 'Root Label',
                content:
                    'This is the root label in your tree.\n\nRight-click on it three times to add three child labels (e.g., Apple, Orange, Banana).\nYou’ll name them in the next steps.\nClick "Next" when Done.',
                placement: 'left',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 7
                target: '.first-label-node',
                title: 'Label Created',
                content:
                    'You have added the first label successfully.\nClick on New Label to Rename',
                placement: 'top',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 8
                target: '.edit-label-name',
                title: 'Edit Label Name',
                content: 'Change the label name to "Apple" here',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 9
                target: '.edit-label-description',
                title: 'Edit Label Description',
                content: 'Add or update the description for the label "Apple".',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 10
                target: '.edit-label-color',
                title: 'Choose Label Color',
                content: 'Select a color for the label "Apple" to easily identify it.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 11
                target: '.edit-label-save',
                title: 'Save Your Changes',
                content: 'Click here to save the label edits you made.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                // 12
                target: '.second-label-node',
                title: 'Second Label Created',
                content:
                    'You have added the second label successfully. Click on the label to rename.',
                placement: 'top',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 13
                target: '.edit-label-name',
                title: 'Edit Label Name',
                content: 'Change the label name to "Orange" here.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 14
                target: '.edit-label-description',
                title: 'Edit Label Description',
                content: 'Add or update the description for the label "Orange".',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 15
                target: '.edit-label-color',
                title: 'Choose Label Color',
                content: 'Select a color for the label "Orange" to easily identify it.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 16
                target: '.edit-label-save',
                title: 'Save Your Changes',
                content: 'Click here to save the label edits you made.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                // 17
                target: '.third-label-node',
                title: 'Third Label Created',
                content:
                    'You have added the third label successfully. Click on the label to rename.',
                placement: 'top',
                disableBeacon: true,
                spotlightClicks: true,
            },
            {
                // 18
                target: '.edit-label-name',
                title: 'Edit Label Name',
                content: 'Change the label name to "Banana" here.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 19
                target: '.edit-label-description',
                title: 'Edit Label Description',
                content: 'Add or update the description for the label "Banana".',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 20
                target: '.edit-label-color',
                title: 'Choose Label Color',
                content: 'Select a color for the label "Banana" to easily identify it.',
                placement: 'top',
                spotlightClicks: true,
            },
            {
                // 21
                target: '.edit-label-save',
                title: 'Save Your Changes',
                content: 'Click here to save the label edits you made.',
                placement: 'bottom',
                spotlightClicks: true,
            },
            {
                // 22
                target: '.label-node.root-node',
                title: 'Label Tree Completed',
                content:
                    'Great job! You have created a complete label tree with a root and three child labels. You can always edit or add more labels as needed. Now you can select this newly created label tree to categorize your annotations.',
                placement: 'left',
                disableBeacon: true,
                spotlightClicks: false,
            },
        ]
        return labelTourSteps
    }

    return []
}
