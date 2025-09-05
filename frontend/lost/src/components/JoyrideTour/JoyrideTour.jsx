import React, { useState, useEffect, useRef } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';
import TourModal from './components/TourModal';
import TourTriggerButton from './components/TourTriggerButton';
import { useTourStepManager } from './hooks/useTourStepManager';
import { useTourClickHandler } from './handlers/tourClickHandler';
import { handleNavigationAndActions } from './handlers/tourNavigationHandler';
import { getTooltipStyles, getOverlayStyles } from './config/tourStyles';
import { useJoyrideSteps } from '../../hooks/useJoyrideSteps';
import { useConditionalPipelinesPaged } from '../../actions/pipeline/pipeline_api';

const JoyrideTour = () => {
  const [run, setRun] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pipelineType, setPipelineType] = useState('');
  const isProcessingPrev = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentStep,
    setCurrentStep,
    currentStepRef,
    readyToRun,
    isNextEnabled,
    useStepReadiness,
  } = useTourStepManager(pipelineType);

  const [latestPipelineId, setLatestPipelineId] = useState(undefined);
  const steps = useJoyrideSteps(pipelineType, latestPipelineId);

  const isPipelinePage = location.pathname.includes('/pipelines')||location.pathname.includes('/instructions');
  const pipelineTargets = ['.latest-pipeline-row', '.first-row-class', '.latest-pipeline-open-button','#nav-pipelines','.add-instruction-button'];

  const typedSteps = steps || [];
  const pipelineDataSteps = typedSteps
    .map((step, index) => (typeof step.target === 'string' && pipelineTargets.includes(step.target)) ? index : -1)
    .filter((index) => index !== -1);

  const requiresPipelineData = typedSteps[currentStep] && pipelineDataSteps.includes(currentStep);

  const pipelineQuery = useConditionalPipelinesPaged(0, 10, isPipelinePage && requiresPipelineData);
  const pipelineData = pipelineQuery.data;

  const siaPipelineId = localStorage.getItem('siaPipelineId');
  const miaPipelineId = localStorage.getItem('miaPipelineId');

  useStepReadiness(steps);

  const setupClickListener = useTourClickHandler(
    run,
    currentStep,
    steps,
    pipelineType,
    latestPipelineId,
    currentStepRef,
    setCurrentStep,
    setRun
  );

  useEffect(() => {
    return setupClickListener();
  }, [run, currentStep, steps, pipelineType, setupClickListener]);

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    const hasCompletedTour = localStorage.getItem('hasCompletedTour') === 'true';
    if (savedStep && !hasCompletedTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = ({ action, index, status, type }) => {
  if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
    localStorage.setItem('hasCompletedTour', 'true');
    setRun(false);
    setIsModalVisible(false);
    localStorage.removeItem('joyrideRunning');
    localStorage.removeItem('currentStep');
    localStorage.removeItem('latestPipelineId');
    isProcessingPrev.current = false;
    return;
  }

    if (type === EVENTS.STEP_AFTER) {
      let nextIndex = index;
      isProcessingPrev.current = false;

      if (action === 'next' && !isProcessingPrev.current) {
        nextIndex = index + 1;
      } else if (action === 'prev') {
        nextIndex = index - 1;
        isProcessingPrev.current = true;
      }
    console.log(`Joyride step action: ${action}, current index: ${index}, next index: ${nextIndex}, isProcessingPrev: ${isProcessingPrev.current}`);

    if (nextIndex !== currentStepRef.current) {
        setCurrentStep(nextIndex);
        localStorage.setItem('currentStep', String(nextIndex));
      }

    if (!isProcessingPrev.current) {
      const result = handleNavigationAndActions(
        index,
        pipelineType,
        latestPipelineId,
        siaPipelineId,
        miaPipelineId,
        navigate
      );

      if (result === 'COMPLETE_TOUR') {
        setRun(false);
        setIsModalVisible(false);
        localStorage.removeItem('joyrideRunning');
        localStorage.removeItem('currentStep');
        localStorage.removeItem('latestPipelineId');
        }
      }
    }
  };

  const handleTourStart = (type = 'mainPipeline') => {
    let latestId;

    if (pipelineData == undefined) {
      pipelineQuery.refetch();
      const pipes = pipelineQuery.data.pipelines.pipes;
      const latestPipeline = pipes.reduce((latest, current) =>
        new Date(current.date) > new Date(latest.date) ? current : latest,
        pipes[0]
      );
      latestId = latestPipeline?.id;
    }else {
      pipelineQuery.refetch();
      const pipes = pipelineData.pipelines.pipes;
      const latestPipeline = pipes.reduce((latest, current) =>
        new Date(current.date) > new Date(latest.date) ? current : latest,
        pipes[0]
      );
      latestId = latestPipeline?.id;
    }

    if (latestId !== undefined) {
      localStorage.setItem('latestPipelineId', String(latestId));
      setLatestPipelineId(latestId);
    } else {
      localStorage.removeItem('latestPipelineId');
      setLatestPipelineId(undefined);
    }

    localStorage.removeItem('hasCompletedTour');
    localStorage.setItem('currentStep', '0');
    localStorage.setItem('joyrideRunning', 'true');
    setPipelineType(type);
    setCurrentStep(0);
    setRun(true);
    setIsModalVisible(false);
  };

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <TourModal
        isVisible={isModalVisible}
        onClose={handleModalClose}
        onStartTour={handleTourStart}
      />

      <TourTriggerButton onStartTour={handleModalOpen} />

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
          debug={true}
          styles={{
            options: { zIndex: 10000 },
            ...getTooltipStyles(currentStep, pipelineType, latestPipelineId, isNextEnabled),
            ...getOverlayStyles(currentStep, pipelineType, latestPipelineId),
          }}
        />
      )}
    </>
  );
};

export default JoyrideTour;
