import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BulkBekrachtigingController extends Controller {
  queryParams = ['size', 'page', 'sort'];

  @tracked size = 900000;
  @tracked page = 0;
  @tracked sort = 'is-bestuurlijke-alias-van.achternaam';

  @action checkBox(mandataris) {
    console.log(mandataris);
  }
}
