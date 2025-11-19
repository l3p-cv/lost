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
      return [8, 11, 15, 22, 23, 27, 29, 31, 33, 35, 38, 41, 44]
    } else if (pipelineType === 'miaPipeline' || pipelineType === 'mainPipeline') {
      return [29, 30]
    } else if (pipelineType === 'instructionTour' && latestPipelineId) {
      return [8, 11, 14, 16, 17]
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
