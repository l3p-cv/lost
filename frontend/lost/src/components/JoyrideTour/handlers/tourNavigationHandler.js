export const handleNavigationAndActions = (index, pipelineType, latestPipelineId, siaPipelineId, miaPipelineId, navigate) => {
  if (pipelineType === 'instructionTour' && !latestPipelineId) {
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
      navigate('/instruction');
      break;
    case 1: {
      const addButton = document.querySelector('.add-instruction-button');
      if (addButton) {
        addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      break;
    }
    case 8: {
      const lastRowEditBtn = document.querySelector('.last-row-highlight');
      break;
    }
    case 13:
      navigate('/pipeline-templates');
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
    case 42:
      if (latestPipelineId) {
        navigate(`/pipeline/${latestPipelineId}`);
      }
      break;
    case 43: {
      const taskNode = document.querySelector('.react-flow__node.react-flow__node-annoTaskNode');
      taskNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
      return 'COMPLETE_TOUR';
    default:
      break;
  }
};

const handleInstructionTourWithPipelineNavigation = (index, navigate, latestPipelineId) => {
  switch (index) {
    case 0:
      navigate('/instruction');
      break;
    case 1: {
      const addButton = document.querySelector('.add-instruction-button');
      if (addButton) {
        addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      break;
    }
    case 8: {
      const lastRowEditBtn = document.querySelector('.last-row-highlight');
      break;
    }
    case 13:
      navigate('/pipelines');
      break;
    case 14:
      if (latestPipelineId) {
        navigate(`/pipeline/${latestPipelineId}`);
      }
      break;
    case 15: {
      const taskNode = document.querySelector('.react-flow__node.react-flow__node-annoTaskNode');
      taskNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      break;
    }
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