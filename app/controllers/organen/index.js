import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganenIndexController extends Controller {
  @tracked orgaanSort = 'naam';

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
