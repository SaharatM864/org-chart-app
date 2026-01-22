import { DriveStep } from 'driver.js';

const COMMON_NAVBAR_STEPS: DriveStep[] = [
  {
    element: '#theme-toggle-btn',
    popover: {
      title: 'Theme Settings',
      description: 'Switch between light and dark modes according to your preference.',
      side: 'bottom',
      align: 'end',
    },
  },
];

export const TOUR_STEPS: { [key: string]: DriveStep[] } = {
  dashboard: [
    {
      element: '#dashboard-title',
      popover: {
        title: 'Welcome to Dashboard',
        description: 'This page provides an overview of all organizational data.',
        side: 'bottom',
        align: 'start',
      },
    },
    ...COMMON_NAVBAR_STEPS,
    {
      element: '#stat-card-total',
      popover: {
        title: 'Employee Statistics',
        description: 'View total employee count and growth metrics here.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#chart-overview',
      popover: {
        title: 'Organization Chart',
        description: 'Visual representation of the organizational structure.',
        side: 'top',
        align: 'center',
      },
    },
  ],
  'chart-view': [
    ...COMMON_NAVBAR_STEPS,
    {
      element: '#position-sidebar',
      popover: {
        title: 'Positions List',
        description: 'List of available positions. These can be dragged onto the chart.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '#sidebar-add-btn',
      popover: {
        title: 'Add Position',
        description: 'Create a new position type by clicking this plus button.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.tour-edit-position-btn',
      popover: {
        title: 'Edit Position',
        description: 'Click the pencil icon to modify position details.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.tour-drag-handle',
      popover: {
        title: 'Drag and Drop',
        description: 'Drag this handle to add the position to the chart workspace.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#chart-toolbar',
      popover: {
        title: 'Toolbar',
        description: 'Tools for zooming, resetting view, and managing display settings.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#main-drop-zone',
      popover: {
        title: 'Workspace',
        description:
          'The main area for the organization chart. Nodes can be moved between parents by dragging and dropping.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '.tour-node-delete-btn',
      popover: {
        title: 'Delete Node',
        description: 'Remove a node using the trash icon. This icon appears on hover.',
        side: 'bottom',
        align: 'center',
      },
      onHighlightStarted: (element) => {
        if (element) {
          (element as HTMLElement).style.opacity = '1';
        }
      },
      onDeselected: (element) => {
        if (element) {
          (element as HTMLElement).style.opacity = '';
        }
      },
    },
  ],
};
