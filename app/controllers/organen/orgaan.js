import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganenOrgaanController extends Controller {
  queryParams = ['bestuursperiode'];

  @tracked bestuursperiode;

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

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
