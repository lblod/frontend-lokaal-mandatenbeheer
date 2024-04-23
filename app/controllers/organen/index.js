import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenIndexController extends Controller {
  @service router;
  @service store;

  orgaanSort = 'naam';

  @action
  async archiveOrgaan(orgaan) {
    orgaan.deactivatedAt = new Date();
    await orgaan.save();
    this.send('reloadModel');
  }

  @action
  async deArchiveOrgaan(orgaan) {
    orgaan.deactivatedAt = undefined;
    await orgaan.save();
    this.send('reloadModel');
  }
}
