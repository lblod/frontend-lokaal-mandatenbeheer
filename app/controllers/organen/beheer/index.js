import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganenBeheerIndexController extends Controller {
  @service router;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'naam';
  size = 5;

  @action
  createNewOrgaan() {
    this.router.transitionTo('organen.beheer.new');
  }
}
