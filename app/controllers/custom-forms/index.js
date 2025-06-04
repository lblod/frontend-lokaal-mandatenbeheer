import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class CustomFormsIndexController extends Controller {
  @service toaster;

  @tracked page = 0;
  @tracked size = 20;
}
