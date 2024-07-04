import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

import {
  INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS,
  INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS,
  INSTALLATIVERGADERING_BEHANDELD_STATUS,
} from 'frontend-lmb/utils/well-known-uris';

import { task } from 'ember-concurrency';

export default class VerkiezingenInstallatievergaderingController extends Controller {
  queryParams = ['bestuursperiode'];
  @service store;
  @service router;

  @tracked bestuursperiode;
  @tracked statusPillSkin = 'info';
  @tracked statusPillLabel = 'info';

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
    this.setInstallatievergaderingStatusPill.perform();
    if (this.model.isBehandeld) {
      return 'Legislatuur';
    }

    return 'Voorbereiding legislatuur';
  }

  setInstallatievergaderingStatusPill = task(async () => {
    const status = await this.model.installatievergadering.status;
    const uriLabelMap = {
      [INSTALLATIVERGADERING_BEHANDELD_STATUS]: {
        skin: 'success',
        label: 'Installatievergadering: Behandeld',
      },
      [INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS]: {
        skin: 'info',
        label: 'Installatievergadering: Te behandelen',
      },
      [INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]: {
        skin: 'warning',
        label: 'Klaar voor installatievergadering',
      },
    };

    this.statusPillSkin = uriLabelMap[status.uri].skin;
    this.statusPillLabel = uriLabelMap[status.uri].label;
  });
}
