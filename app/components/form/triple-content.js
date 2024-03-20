import Component from '@glimmer/component';
import ENV from 'frontend-lmb/config/environment';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
