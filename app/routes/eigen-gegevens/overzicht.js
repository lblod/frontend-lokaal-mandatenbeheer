import Route from '@ember/routing/route';

import moment from 'moment';

export default class EigenGegevensOverzichtRoute extends Route {
  async model() {
    return {
      forms: [
        {
          id: 1,
          label: 'test formulier',
          description: `
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          `,
          createdAt: moment(new Date()).format('DD-MM-YYYY HH:mm'),
          modified: moment(new Date()).format('DD-MM-YYYY HH:mm'),
        },
      ],
    };
  }
}
