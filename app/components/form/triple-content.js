import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import ENV from 'frontend-lmb/config/environment';

export default class FormTripleContentComponent extends Component {
  @tracked expanded = false;

  get showSourceTriples() {
    return ENV.APP.SHOW_FORM_CONTENT;
  }

  @action
  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}
