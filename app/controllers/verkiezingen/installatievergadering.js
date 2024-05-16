import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class VerkiezingenInstallatievergaderingController extends Controller {
  queryParams = ['bestuursperiode'];
  @service store;
  @service router;

  @tracked bestuursperiode;

  @action
  async selectStatus(status) {
    const installatievergadering = this.model.installatievergadering;
    installatievergadering.status = status;
    await installatievergadering.save();
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }
}
