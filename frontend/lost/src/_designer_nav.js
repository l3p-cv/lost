export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer'
    },
    {
      title: true,
      name: 'Pipelines',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: 'my-class', style: { fontFamily: 'Verdana' }, id: 'my-id'}
      },
      class: ''             // optional class names space delimited list for title item ex: 'text-center'
    },
    {
      name: 'Start Pipeline',
      url: '/pipeline/start',
      icon: 'fa-plus',
    },
    {
      name: 'Pipelines',
      url: '/pipeline/running',
      icon: 'fa-tasks',
    },
    {
      title: true,
      name: 'Project',
      wrapper: {
        element: '',
        attributes: {},
      },
    },
    {
      name: 'Media',
      url: '/media',
      icon: 'fa-upload',
    },
    {
      name: 'Labels',
      url: '/labels',
      icon: 'fa-tag',
    },
    {
      name: 'Users',
      url: '/users',
      icon: 'fa-group',
    },
  ],
}
