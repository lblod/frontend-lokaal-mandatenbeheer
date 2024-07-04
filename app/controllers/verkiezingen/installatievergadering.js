import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

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

    if (
      installatievergadering.get('status.uri') ===
      INSTALLATIEVERGADERING_BEHANDELD_STATUS
    ) {
      await fetch(
        `/installatievergadering-api/${installatievergadering.id}/move-ocmw-organs`,
        { method: 'POST' }
      );
    }

    this.router.refresh();
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

  get title() {
    if (this.model.isBehandeld) {
      return 'Legislatuur';
    }

    return 'Voorbereiding legislatuur';
  }
}
