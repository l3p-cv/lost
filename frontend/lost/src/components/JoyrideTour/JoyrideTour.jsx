import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

import TourModal from './components/TourModal';
import TourTriggerButton from './components/TourTriggerButton';
import { useTourStepManager } from './hooks/useTourStepManager';
import { useTourClickHandler } from './handlers/tourClickHandler';
import { handleNavigationAndActions } from './handlers/tourNavigationHandler';
import { getTooltipStyles, getOverlayStyles } from './config/tourStyles';
import { useJoyrideSteps } from '../../hooks/useJoyrideSteps';
import { usePipelinesPaged } from '../../actions/pipeline/pipeline_api'; 

const JoyrideTour = () => {
  const [run, setRun] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pipelineType, setPipelineType] = useState('mainPipeline');

  const navigate = useNavigate();

  const { data: pipelineData } = usePipelinesPaged(0, 1);

  const {
    currentStep,
    setCurrentStep,
    currentStepRef,
    readyToRun,
    isNextEnabled,
    useStepReadiness,
  } = useTourStepManager(pipelineType);

  const siaPipelineId = localStorage.getItem('siaPipelineId');
  const miaPipelineId = localStorage.getItem('miaPipelineId');
  const latestPipelineId = localStorage.getItem('latestPipelineId');

  const steps = useJoyrideSteps(pipelineType);

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
  };

  const handleTourStart = (type = 'mainPipeline') => {
    if (pipelineData && pipelineData.pipelines && pipelineData.pipelines.pipes && pipelineData.pipelines.pipes.length > 0) {
      const pipes = pipelineData.pipelines.pipes;
      const latestPipeline = pipes.reduce((latest, current) =>
        new Date(current.date) > new Date(latest.date) ? current : latest,
        pipes[0]
      );
      const latestId = latestPipeline?.id;
      if (latestId) {
        localStorage.setItem('latestPipelineId', latestId);
      }
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