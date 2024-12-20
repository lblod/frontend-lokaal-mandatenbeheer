import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedNavigationBarComponent extends Component {
  @service router;

  get isVisible() {
    const notVisibleOnRoutes = ['index'];
    return !notVisibleOnRoutes.includes(this.router.currentRouteName);
  }
}
