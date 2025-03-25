import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';

export default class CustomFormsOverviewController extends Controller {
  @tracked page = 0;
  @tracked size = 20;
}
