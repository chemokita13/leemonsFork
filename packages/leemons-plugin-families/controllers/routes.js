module.exports = [
  /**
   * User agents
   * */
  {
    path: '/search-users',
    method: 'POST',
    handler: 'families.searchUsers',
    authenticated: true,
    allowedPermissions: {
      'plugins.families.families': {
        actions: ['update', 'create', 'admin'],
      },
    },
  },
  /**
   * Dataset
   * */
  {
    path: '/dataset-form',
    method: 'GET',
    handler: 'families.getDatasetForm',
    authenticated: true,
    allowedPermissions: {
      'plugins.families.families': {
        actions: ['view', 'update', 'create', 'admin'],
      },
    },
  },
  /**
   * Families
   * */
  {
    path: '/add',
    method: 'POST',
    handler: 'families.add',
    authenticated: true,
    allowedPermissions: {
      'plugins.families.families': {
        actions: ['create', 'admin'],
      },
    },
  },
  {
    path: '/detail/:id',
    method: 'GET',
    handler: 'families.detail',
    authenticated: true,
  },
  {
    path: '/list',
    method: 'POST',
    handler: 'families.list',
    authenticated: true,
    allowedPermissions: {
      'plugins.families.families': {
        actions: ['view', 'admin'],
      },
    },
  },
];
