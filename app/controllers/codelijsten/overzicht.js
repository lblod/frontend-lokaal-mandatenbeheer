import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenOverzichtController extends Controller {
  @tracked filter;
  @tracked page;

  @action
  search(event) {
    this.page = 0;
    this.filter = event?.target?.value ?? '';
  }
}
