export const getTooltipStyles = (stepIndex, pipelineType, latestPipelineId, isNextEnabled) => {
  const baseStyles = {
    buttonNext: {
      backgroundColor: '#092f38',
      color: '#fff',
      border: '1px solid #092f38',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
    },
    buttonBack: {
      backgroundColor: '#fff',
      color: '#092f38',
      border: '1px solid #092f38',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
    },
};


  if (pipelineType === 'instructionTour' && latestPipelineId ==undefined) {
    const hideNextInstruction = [5, 6, 7, 8, 11, 12, 10, 22, 18, 19, 20, 27, 28, 29, 31, 33, 35, 37, 38, 41, 44];
    const hideBackInstruction = [2, 5, 6, 7, 8, 11, 12, 13, 22, 25, 16, 17, 18, 19, 20, 23, 28, 30, 32, 34, 36, 38, 39, 42, 43, 44, 45];
    return {
      ...baseStyles,
      ...(hideNextInstruction.includes(stepIndex) && { buttonNext: { display: 'none' } }),
      ...(hideBackInstruction.includes(stepIndex) && { buttonBack: { display: 'none' } }),
    };
  } else if (pipelineType === 'instructionTour' && latestPipelineId) {
    const hideNextInstruction = [5, 6, 7, 8, 11, 12, 10];
    const hideBackInstruction = [2, 5, 6, 7, 8, 11, 12, 13];
    return {
      ...baseStyles,
      ...(hideNextInstruction.includes(stepIndex) && { buttonNext: { display: 'none' } }),
      ...(hideBackInstruction.includes(stepIndex) && { buttonBack: { display: 'none' } }),
    };
  } else if (pipelineType === 'labelTour') {
    const hideNextInstruction = [3, 5, 7, 10, 11, 12, 15, 16, 17, 20, 21];
    const hideBackInstruction = [4, 6];
    return {
      ...baseStyles,
      ...(hideNextInstruction.includes(stepIndex) && { buttonNext: { display: 'none' } }),
      ...(hideBackInstruction.includes(stepIndex) && { buttonBack: { display: 'none' } }),
    };
  }

  const hideNextDefault = [5, 6, 9, 14, 16, 18, 20, 22, 24, 25, 28];
  const hideBack = [3, 4, 10, 12, 15, 17, 19, 21, 23, 25, 26, 29, 30];

  const hideNext = [...hideNextDefault];
  if (stepIndex === 29 && !isNextEnabled) {
    hideNext.push(29);
  }

  return {
    ...baseStyles,
    ...(hideNext.includes(stepIndex) && { buttonNext: { display: 'none' } }),
    ...(hideBack.includes(stepIndex) && { buttonBack: { display: 'none' } }),
  };
};

export const getOverlayStyles = (stepIndex, pipelineType, latestPipelineId) => {
  if (pipelineType === 'instructionTour' && latestPipelineId == undefined) {
    const noOverlaySteps = [6, 12, 21 ,26, 28, 30, 34, 35, 36, 37, 38, 44];
    return {
      options: {
        overlayColor: noOverlaySteps.includes(stepIndex) ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
        overlayOpacity: noOverlaySteps.includes(stepIndex) ? 0 : null,
        zIndex: 10000,
      },
      ...(noOverlaySteps.includes(stepIndex) && {
        overlay: { pointerEvents: 'none' },
      }),
    };
  } else if (pipelineType === 'instructionTour' && latestPipelineId) {
    const noOverlaySteps = [6, 12, 16, 17];
    return {
      options: {
        overlayColor: noOverlaySteps.includes(stepIndex) ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
        overlayOpacity: noOverlaySteps.includes(stepIndex) ? 0 : null,
        zIndex: 10000,
      },
      ...(noOverlaySteps.includes(stepIndex) && {
        overlay: { pointerEvents: 'none' },
      }),
    };
  } else if (pipelineType === 'labelTour') {
    const noOverlaySteps = [6, 11, 16, 21, 22];
    return {
      options: {
        overlayColor: noOverlaySteps.includes(stepIndex) ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
        overlayOpacity: noOverlaySteps.includes(stepIndex) ? 0 : null,
        zIndex: 10000,
      },
      ...(noOverlaySteps.includes(stepIndex) && {
        overlay: { pointerEvents: 'none' },
      }),
    };
  }

  const noOverlaySteps = [13, 15, 17, 19, 21, 22, 23, 24];
  return {
    options: {
      overlayColor: noOverlaySteps.includes(stepIndex) ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
      overlayOpacity: noOverlaySteps.includes(stepIndex) ? 0 : null,
      zIndex: 10000,
    },
    ...(noOverlaySteps.includes(stepIndex) && {
      overlay: { pointerEvents: 'none' },
    }),
  };
};