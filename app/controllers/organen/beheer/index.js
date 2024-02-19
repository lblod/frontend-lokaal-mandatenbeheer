import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganenBeheerIndexController extends Controller {
  @service router;

  @tracked active_page = 0;
  active_sort = 'naam';
  active_size = 5;

  @action
  createNewOrgaan() {
    this.router.transitionTo('organen.beheer.new');
  }
}
