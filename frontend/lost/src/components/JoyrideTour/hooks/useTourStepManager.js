import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { pipelineStepMap, instructionStepMap, instructionStepMap2, labelStepMap } from '../config/stepMaps';

export const useTourStepManager = (pipelineType) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [readyToRun, setReadyToRun] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(true);
  const currentStepRef = useRef(currentStep);
  const location = useLocation();

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    const hasCompletedTour = localStorage.getItem('hasCompletedTour') === 'true';
    if (savedStep && !hasCompletedTour) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  const useStepReadiness = (steps) => {
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
  };

  useEffect(() => {
    const handleNextStep = (event) => {
      const latestPipelineId = localStorage.getItem('latestPipelineId');
      const mapToUse = 
        pipelineType === 'instructionTour' && !latestPipelineId 
          ? instructionStepMap 
          : pipelineType === 'instructionTour' && latestPipelineId 
          ? instructionStepMap2 
          : pipelineType === 'labelTour' 
          ? labelStepMap
          : pipelineStepMap;

      const nextStep = mapToUse[event.detail.step];
      if (typeof nextStep === 'number' && nextStep !== currentStepRef.current) {
        setCurrentStep(nextStep);
        localStorage.setItem('currentStep', String(nextStep));
      }
    };

    window.addEventListener('joyride-next-step', handleNextStep);
    return () => {
      window.removeEventListener('joyride-next-step', handleNextStep);
    };
  }, [pipelineType]);

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
    if (currentStep === 29 && (pipelineType === 'miaPipeline' || pipelineType === 'mainPipeline')) {
      setIsNextEnabled(false);
      const timer = setTimeout(() => setIsNextEnabled(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setIsNextEnabled(true);
    }
  }, [currentStep, pipelineType]);

  return {
    currentStep,
    setCurrentStep,
    currentStepRef,
    readyToRun,
    isNextEnabled,
    useStepReadiness,
  };
};