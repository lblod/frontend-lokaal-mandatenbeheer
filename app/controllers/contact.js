import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class ContactController extends Controller {
  @service session;
}
