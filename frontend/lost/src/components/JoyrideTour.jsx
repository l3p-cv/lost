import React, { useState, useEffect, useRef } from 'react';
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
  const [pipelineType, setPipelineType] = useState('mainPipeline');
  const [readyToRun, setReadyToRun] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const currentStepRef = useRef(currentStep);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const siaPipelineId = localStorage.getItem('siaPipelineId');
  const miaPipelineId = localStorage.getItem('miaPipelineId');
  const steps = useJoyrideSteps(pipelineType);

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
      const target = steps[currentStep]?.target;
      const element = target && document.querySelector(target);

      if (element) {
        setTimeout(() => setReadyToRun(true), 300);
      } else {
        setReadyToRun(false);
        timeoutId = setTimeout(checkDomReady, 200);
      }
    };
    checkDomReady();
    return () => clearTimeout(timeoutId);
  }, [location.pathname, steps, currentStep]);

  useEffect(() => {
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
      'latest-running-pipeline': 29,
      'latest-running-annotask': 30,
    };

    const handleNextStep = (event) => {
      const nextStep = stepMap[event.detail.step];
      if (typeof nextStep === 'number' && nextStep !== currentStepRef.current) {
        setCurrentStep(nextStep);
        localStorage.setItem('currentStep', String(nextStep));
      }
    };

    window.addEventListener('joyride-next-step', handleNextStep);
    return () => {
      window.removeEventListener('joyride-next-step', handleNextStep);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/annotation') {
      window.dispatchEvent(
        new CustomEvent('joyride-next-step', {
          detail: { step: 'latest-running-annotask' },
        })
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    if (currentStep === 29 && pipelineType === 'miaPipeline') {
      setIsNextEnabled(false);
      const timer = setTimeout(() => setIsNextEnabled(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setIsNextEnabled(true);
    }
  }, [currentStep, pipelineType]);

  useEffect(() => {
    if (!run) return;

    const stepsToWatch = [29, 30];
    if (!stepsToWatch.includes(currentStep)) return;

    const target = steps[currentStep]?.target;
    if (!target) return;

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    const handleClick = () => {
      setRun(false);
      localStorage.setItem('hasCompletedTour', 'true');
      localStorage.removeItem('joyrideRunning');
      localStorage.removeItem('currentStep');
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [run, currentStep, steps]);

  const handleJoyrideCallback = ({ action, index, status, type }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      localStorage.setItem('hasCompletedTour', 'true');
      setRun(false);
      setIsModalVisible(false);
      localStorage.removeItem('joyrideRunning');
      localStorage.removeItem('currentStep');
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      let nextIndex = index;

      if (action === 'next') nextIndex = index + 1;
      else if (action === 'prev') nextIndex = index - 1;

      if (nextIndex !== currentStepRef.current) {
        setCurrentStep(nextIndex);
        localStorage.setItem('currentStep', String(nextIndex));
      }

      switch (index) {
        case 0:
          navigate('/pipeline-templates');
          break;
        case 2:
          if (pipelineType === 'miaPipeline' && miaPipelineId) {
            navigate(`/pipeline-template/${miaPipelineId}`);
          } else if (pipelineType === 'mainPipeline' && siaPipelineId) {
            navigate(`/pipeline-template/${siaPipelineId}`);
          }
          break;
        case 3: {
          const node = document.querySelector('.react-flow__node-datasourceNode[data-id="0"]');
          node?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          break;
        }
        case 11: {
          const taskNode = document.querySelector('.react-flow__node.anno-task-node');
          taskNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          break;
        }
        case 12: {
          const combo = document.querySelector('#instruction [role="combobox"]');
          combo?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          break;
        }
        case 29:
          setTimeout(() => navigate('/annotation'), 1000);
          break;
        case 30:
          setRun(false);
          setIsModalVisible(false);
          localStorage.removeItem('joyrideRunning');
          localStorage.removeItem('currentStep');
          break;
        default:
          break;
      }
    }
  };

  const handleTourStart = (type = 'mainPipeline') => {
    localStorage.removeItem('hasCompletedTour');
    localStorage.setItem('currentStep', '0');
    localStorage.setItem('joyrideRunning', 'true');
    setPipelineType(type);
    setCurrentStep(0);
    setRun(true);
    setIsModalVisible(false);
  };

  const getTooltipStyles = (stepIndex) => {
    const hideNextDefault = [5, 6, 9, 14, 16, 18, 20, 22, 24, 25, 28];
    const hideBack = [3, 4, 10, 12, 15, 17, 19, 21, 23, 25, 26, 29, 30];

    const hideNext = [...hideNextDefault];
    if (stepIndex === 29 && !isNextEnabled) {
      hideNext.push(29);
    }

    return {
      ...(hideNext.includes(stepIndex) && { buttonNext: { display: 'none' } }),
      ...(hideBack.includes(stepIndex) && { buttonBack: { display: 'none' } }),
    };
  };

  const getOverlayStyles = (stepIndex) => {
    const noOverlaySteps = [13, 15, 17, 19, 21, 22, 23, 24];
    return {
      options: {
        overlayColor: noOverlaySteps.includes(stepIndex)
          ? 'transparent'
          : 'rgba(0, 0, 0, 0.5)',
        overlayOpacity: noOverlaySteps.includes(stepIndex) ? 0 : 0.5,
        zIndex: 10000,
      },
      ...(noOverlaySteps.includes(stepIndex) && {
        overlay: { pointerEvents: 'none' },
      }),
    };
  };

  return (
    <>
      <CModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        backdrop="static"
        size="lg"
      >
        <CModalHeader>
          <h5>Welcome to the Tour</h5>
        </CModalHeader>
        <CModalBody>
          <p className="mb-4 text-center">
            This is a guided tour of the available pipelines. Select a pipeline below to learn more and start the tour.
          </p>
          <TourStartTable onStartTour={handleTourStart} />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              localStorage.removeItem('joyrideRunning');
              setIsModalVisible(false);
            }}
          >            
            Cancel
          </CButton>
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