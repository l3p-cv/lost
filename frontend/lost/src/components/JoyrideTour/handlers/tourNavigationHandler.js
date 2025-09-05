export const handleNavigationAndActions = (index, pipelineType, latestPipelineId, siaPipelineId, miaPipelineId, navigate) => {
  if (pipelineType === 'instructionTour' && latestPipelineId == undefined) {
    return handleInstructionTourNavigation(index, navigate, siaPipelineId, latestPipelineId);
  } else if (pipelineType === 'miaPipeline' || pipelineType === 'mainPipeline') {
    return handlePipelineTourNavigation(index, pipelineType, navigate, miaPipelineId, siaPipelineId);
  } else if (pipelineType === 'instructionTour' && latestPipelineId) {
    return handleInstructionTourWithPipelineNavigation(index, navigate, latestPipelineId);
  } else if (pipelineType === 'labelTour') {
    return handleLabelTourNavigation(index, navigate);
  }
};

const handleInstructionTourNavigation = (index, navigate, siaPipelineId, latestPipelineId) => {
  switch (index) {
    case 0:
      navigate('/instructions');
      break;

    case 12:
      console.log('Current Step in case 12', index);
      navigate('/pipeline-templates');
      window.dispatchEvent(new CustomEvent('joyride-next-step', {
        detail: { step: 'after-nav' }
      }));
      break;
    case 15:
      if (siaPipelineId) {
        navigate(`/pipeline-template/${siaPipelineId}`);
      }
      break;
    case 16: {
      const node = document.querySelector('.react-flow__node-datasourceNode[data-id="0"]');
      node?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      break;
    }
    case 24: {
      const taskNode = document.querySelector('.react-flow__node.anno-task-node');
      taskNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      break;
    }
    case 25: {
      const combo = document.querySelector('#instruction [role="combobox"]');
      combo?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      break;
    }
    default:
      break;
  }
};

const handlePipelineTourNavigation = (index, pipelineType, navigate, miaPipelineId, siaPipelineId) => {
  switch (index) {
    case 0:
      navigate('/pipeline-templates');
      break;
    case 1:
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
      return 'COMPLETE_TOUR';
    default:
      break;
  }
};

const handleInstructionTourWithPipelineNavigation = (index, navigate, latestPipelineId) => {
  switch (index) {
    case 0:
      navigate('/instructions');
      break;
    case 12:
      console.log('Current Step in case 12', index);
      navigate('/pipelines');
      window.dispatchEvent(new CustomEvent('joyride-next-step', {
        detail: { step: 'after-nav' }
      }));
      break;
    default:
      break;
  }
};

const handleLabelTourNavigation = (index, navigate) => {
  switch (index) {
    case 0:
      navigate('/labels');
      break;
    case 5:
      localStorage.removeItem('newlyCreatedLabelTreeId');
      break;
    default:
      break;
  }
};