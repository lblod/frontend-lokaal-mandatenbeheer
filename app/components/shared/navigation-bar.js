import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedNavigationBarComponent extends Component {
  @service router;

  get isVisible() {
    const notVisibleOnRoutes = [
      'overzicht',
      'overzicht.index',
      'overzicht.admin',
    ];
    return !notVisibleOnRoutes.includes(this.router.currentRouteName);
  }
}
