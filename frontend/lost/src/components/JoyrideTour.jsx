import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJoyrideSteps } from '../hooks/useJoyrideSteps';
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import TourStartTable from '../containers/pipeline/TourStartTable';

const JoyrideTour = () => {
  const [run, setRun] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [readyToRun, setReadyToRun] = useState(false);
  const [shouldResume, setShouldResume] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const siaPipelineId = localStorage.getItem('siaPipelineId');
  const steps = useJoyrideSteps('mainPipeline');

  useEffect(() => {
    const handleResume = () => setShouldResume(true);

    const handleJoyrideNextStep = (event) => {
      const { step } = event.detail;

      const stepMap = {
        'dropdown-open': 6,
        'datasource-selected': 7,
        'path-selected': 9,
        'done-clicked': 10,
        'anno-name': 11,
        'anno-task-info-done': 15,
        'user-selection-done': 17,
        'label-tree-selection-done': 19,
        'label-selection-done': 21,
        'storage-settings-done': 23,
        'configuration-done': 25,
        'template-next': 26,
        'last-step-done':29
      };

      const nextStep = stepMap[step];
      if (typeof nextStep === 'number') {
        setCurrentStep(nextStep);
        localStorage.setItem('currentStep', String(nextStep));
      }
    };

    window.addEventListener('resume-joyride', handleResume);
    window.addEventListener('joyride-next-step', handleJoyrideNextStep);

    return () => {
      window.removeEventListener('resume-joyride', handleResume);
      window.removeEventListener('joyride-next-step', handleJoyrideNextStep);
    };
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('joyrideRunning', run ? 'true' : 'false');
  }, [run]);

  const getTooltipStyles = (stepIndex) => {
    const hideNext = [5, 6, 9, 14, 16, 18, 20, 22, 24, 25, 28];
    const hideBack = [3, 4, 10, 12, 15, 17, 19, 21, 23, 25, 26];
    return {
      ...(hideNext.includes(stepIndex) && { buttonNext: { display: 'none' } }),
      ...(hideBack.includes(stepIndex) && { buttonBack: { display: 'none' } }),
    };
  };

  const getOverlayStyles = (stepIndex) => {
    const noOverlaySteps = [13, 15, 17, 19, 21, 22, 23, 24];
    if (noOverlaySteps.includes(stepIndex)) {
      return {
        options: {
          overlayColor: 'transparent',
          overlayOpacity: 0,
          zIndex: 10000,
        },
        overlay: { pointerEvents: 'none' },
      };
    }
    return {
      options: {
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        overlayOpacity: 0.5,
        zIndex: 10000,
      },
    };
  };

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    const hasCompletedTour = localStorage.getItem('hasCompletedTour') === 'true';
    if (savedStep && !hasCompletedTour) {
      setCurrentStep(parseInt(savedStep, 10));
      setRun(true);
    }
  }, []);

  useEffect(() => {
    let timeoutId;

    const checkDomReady = () => {
      const currentTarget = steps[currentStep]?.target;
      const element = currentTarget && document.querySelector(currentTarget);

      if (element) {
        const delayTimer = setTimeout(() => setReadyToRun(true), 500);
        return () => clearTimeout(delayTimer);
      } else {
        setReadyToRun(false);
        timeoutId = setTimeout(checkDomReady, 200);
      }
    };

    checkDomReady();

    return () => clearTimeout(timeoutId);
  }, [location.pathname, steps, currentStep, shouldResume, run]);

  const handleJoyrideCallback = ({ action, index, status, type }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      localStorage.setItem('hasCompletedTour', 'true');
      setRun(false);
      setIsModalVisible(false);
      localStorage.removeItem('currentStep');
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === 'next') {
        const nextIndex = index + 1;
        setCurrentStep(nextIndex);
        localStorage.setItem('currentStep', String(nextIndex));

        switch (index) {
          case 0:
            navigate('/pipeline-templates');
            break;
          case 1:
            if (siaPipelineId) setShouldResume(true);
            break;
          case 2:
            if (siaPipelineId) navigate(`/pipeline-template/${siaPipelineId}`);
            setShouldResume(true);
            break;
          case 3:
            const node = document.querySelector('.react-flow__node-datasourceNode[data-id="0"]');
            if (node) node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            break;
          case 11:
            const taskNode = document.querySelector('.react-flow__node.anno-task-node');
            if (taskNode) taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            break;
          case 12:
            const combo = document.querySelector('#instruction [role="combobox"]');
            if (combo) combo.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            break;
          default:
            break;
        }
      } else if (action === 'prev') {
        const prevIndex = index - 1;
        setCurrentStep(prevIndex);
        localStorage.setItem('currentStep', String(prevIndex));
      }
    }
  };

  const handleTourStart = () => {
    localStorage.removeItem('hasCompletedTour');
    localStorage.setItem('currentStep', '0');
    setCurrentStep(0);
    setRun(true);
    setIsModalVisible(false);
  };

  return (
    <>
      <CModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} backdrop="static" size="lg">
        <CModalHeader>
          <h5>Welcome to the Tour</h5>
        </CModalHeader>
        <CModalBody>
          <p className="mb-4 text-center">  This is a guided tour of the available pipelines. Select a pipeline below to learn more and start the tour.</p>
          <TourStartTable onStartTour={handleTourStart} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsModalVisible(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>

      {location.pathname === '/dashboard' && (
        <CButton
          color="link"
          onClick={() => setIsModalVisible(true)}
          style={{ position: 'absolute', top: 13, right: 150, zIndex: 9999 }}
          title="Start Tour"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </CButton>
      )}

      {readyToRun && run && (
        <Joyride
          run={run}
          steps={steps}
          stepIndex={currentStep}
          callback={handleJoyrideCallback}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          disableOverlayClose
          styles={{
            options: { zIndex: 10000 },
            ...getTooltipStyles(currentStep),
            ...getOverlayStyles(currentStep),
          }}
        />
      )}
    </>
  );
};

export default JoyrideTour;