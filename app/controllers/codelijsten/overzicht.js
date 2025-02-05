import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenOverzichtController extends Controller {
  @tracked filter;

  @action
  search(event) {
    this.filter = event?.target?.value ?? '';
  }
}
