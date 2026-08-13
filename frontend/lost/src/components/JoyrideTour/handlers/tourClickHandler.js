export const useTourClickHandler = (
  run,
  currentStep,
  steps,
  pipelineType,
  latestPipelineId,
  currentStepRef,
  setCurrentStep,
  setRun,
) => {
  const getClickStepsForTourType = () => {
    if (pipelineType === 'instructionTour' && latestPipelineId == undefined) {
      return [6, 9, 12, 16, 23, 24, 28, 30, 32, 34, 36, 39, 42, 44, 45]
    } else if (pipelineType === 'miaPipeline' || pipelineType === 'mainPipeline') {
      return [29, 30]
    } else if (pipelineType === 'instructionTour' && latestPipelineId) {
      return [6, 9, 12, 14, 15, 16, 17, 18]
    } else if (pipelineType === 'labelTour') {
      return [3, 5, 7, 10, 11, 12, 15, 16, 17, 20, 21]
    }
    return []
  }

  const handleClick = (shouldCompleteTour = false) => {
    if (shouldCompleteTour) {
      setRun(false)
      localStorage.setItem('hasCompletedTour', 'true')
      localStorage.removeItem('joyrideRunning')
      localStorage.removeItem('currentStep')
    } else {
      const nextStep = currentStepRef.current + 1
      setCurrentStep(nextStep)
      localStorage.setItem('currentStep', String(nextStep))
    }
  }

  const setupClickListener = () => {
    if (!run) return

    const clickSteps = getClickStepsForTourType()
    if (!clickSteps.includes(currentStep)) return

    const target = steps[currentStep]?.target
    if (!target) return

    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return

    const shouldCompleteTour =
      (pipelineType === 'miaPipeline' || pipelineType === 'mainPipeline') &&
      [29, 30].includes(currentStep)

    const clickHandler = () => handleClick(shouldCompleteTour)

    el.addEventListener('click', clickHandler)
    return () => el.removeEventListener('click', clickHandler)
  }

  return setupClickListener
}
