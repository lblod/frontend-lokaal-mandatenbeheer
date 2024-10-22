import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BulkBekrachtigingController extends Controller {
  queryParams = ['size', 'page', 'sort'];

  @tracked size = 900000;
  @tracked page = 0;
  @tracked sort = 'is-bestuurlijke-alias-van.achternaam';

  checked = new Set();

  @action checkBox(mandataris, state) {
    if (state) {
      this.checked.add(mandataris);
    } else {
      this.checked.delete(mandataris);
    }
  }
}
