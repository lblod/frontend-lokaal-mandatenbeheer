import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class OrganenOrgaanController extends Controller {
  @action
  async archiveOrgaan() {
    this.model.bestuursorgaan.deactivatedAt = new Date();
    await this.model.bestuursorgaan.save();
  }

  @action
  async deArchiveOrgaan() {
    this.model.bestuursorgaan.deactivatedAt = undefined;
    await this.model.bestuursorgaan.save();
  }
}
