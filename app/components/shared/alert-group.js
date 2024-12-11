import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class SharedAlertGroupComponent extends Component {
  @tracked alerts = A();
}
