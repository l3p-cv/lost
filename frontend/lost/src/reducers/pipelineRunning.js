import TYPES from '../types'
const INITITAL_STATE = {
    style: {
        container: {
            paddingTop: 24, //pixel
            paddingBottom: 40, //pixel
        },
        shape: {
            size: 60,
            borderWidth: 4,
            borderRadius: '50%',
        },
        line: {
            borderWidth: 3,
            borderColor: 'gray',
            padding: 0,
        },
    },
    steps: [
        {
            text: '1',
            icon: 'fa-rocket',
            shapeBorderColor: '#092F38',
            shapeBackgroundColor: 'white',
            shapeContentColor: '#092F38',
            verified: false,
        },
        {
            text: '2',
            icon: 'fa-eye',
            shapeBorderColor: '#092F38',
            shapeBackgroundColor: 'white',
            shapeContentColor: '#092F38',
            verified: false,
            modalOpened: false,
            modalClickedId: 0,
            svgStyle: {
                width: '100%',
            },
        },
    ],
    currentStep: 0,
}
export default (state = INITITAL_STATE, action) => {
    switch (action.type) {
        case 'PIPELINE_RUNNING_RESET':
            return {
                ...INITITAL_STATE,
            }
        case 'PIPELINE_RUNNING_GET_PIPELINES':
            return {
                ...state,
                step0Data: action.payload,
            }
        case 'PIPELINE_RUNNING_GET_PIPELINE':
            return {
                ...state,
                step1Data:
                    action.payload === 'ERROR'
                        ? false
                        : {
                              ...action.payload,
                              elements: action.payload.elements.map((el) => {
                                  let connection = []
                                  if (el.peOut) {
                                      connection = el.peOut.map((el) => {
                                          return {
                                              id: el,
                                          }
                                      })
                                  }
                                  if ('datasource' in el) {
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'datasource',
                                          title: 'Datasource',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  } else if ('script' in el) {
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'script',
                                          title: 'Script',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  } else if ('annoTask' in el) {
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'annoTask',
                                          title: 'Annotation Task',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  } else if ('visualOutput' in el) {
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'visualOutput',
                                          title: 'Visualization',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  } else if ('dataExport' in el) {
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'dataExport',
                                          title: 'Data Export',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  } else if ('loop' in el) {
                                      if (el.loop.peJumpId) {
                                          connection.push({
                                              id: el.loop.peJumpId,
                                              lineStyle: {
                                                  stroke: 'red',
                                                  strokeWidth: '1.8px',
                                                  fill: 'white',
                                                  strokeDasharray: '5, 5',
                                              },
                                              arrowheadStyle: {
                                                  fill: 'red',
                                                  stroke: 'none',
                                              },
                                          })
                                      }
                                      return {
                                          ...el,
                                          id: el.peN,
                                          type: 'loop',
                                          title: 'Loop',
                                          connection: connection,
                                          footer: el.state,
                                      }
                                  }
                                  return undefined
                              }),
                          },
            }
        case 'PIPELINE_RUNNING_SELECT_TAB':
            return {
                ...state,
                currentStep: action.payload.tabId,
            }
        case 'PIPELINE_RUNNING_VERIFY_TAB':
            return {
                ...state,
                steps: state.steps.map((el, i) => {
                    if (i === action.payload.tabId) {
                        return {
                            ...el,
                            verified: action.payload.verified,
                        }
                    }
                    return el
                }),
            }
        case 'PIPELINE_RUNNING_PAUSE':
            return {
                ...state,
                step1Data: {
                    ...state.step1Data,
                    progress: action.payload === 'success' ? 'PAUSED' : 'ERROR',
                },
            }
        case 'PIPELINE_RUNNING_PLAY':
            return {
                ...state,
                step1Data: {
                    ...state.step1Data,
                    progress: action.payload === 'success' ? '1' : 'ERROR',
                },
            }
        case 'PIPELINE_RUNNING_TOGGLE_MODAL':
            return {
                ...state,
                steps: state.steps.map((el, i) => {
                    // Graph Data
                    if (i === 1) {
                        return {
                            ...el,
                            modalOpened: !state.steps[1].modalOpened,
                            modalClickedId: action.payload.id,
                        }
                    }
                    return el
                }),
            }
        case TYPES.PIPELINE_RUNNING_UPDATE_ARGUMENTS_REQUEST_STATUS:
            return {
                ...state,
                step1Data: {
                    ...state.step1Data,
                    updateArgumentsRequestStatus: action.payload,
                },
            }
        default:
            return state
    }
}
