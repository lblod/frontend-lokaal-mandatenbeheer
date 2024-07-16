import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import {
  INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS,
  INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS,
  INSTALLATIEVERGADERING_BEHANDELD_STATUS,
} from 'frontend-lmb/utils/well-known-uris';

import { task } from 'ember-concurrency';

export default class PrepareInstallatievergaderingController extends Controller {
  queryParams = ['bestuursperiode'];
  @service store;
  @service router;

  @tracked bestuursperiode;
  @tracked statusPillSkin = 'info';
  @tracked statusPillLabel = 'info';
  @tracked nextStatus;

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
    this.setNextStatus.perform();

    return this.model.selectedPeriod.label;
  }

  setInstallatievergaderingStatusPill = task(async () => {
    const status = await this.model.installatievergadering.status;
    const uriLabelMap = {
      [INSTALLATIEVERGADERING_BEHANDELD_STATUS]: {
        skin: 'success',
        label: 'Behandeld',
      },
      [INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS]: {
        skin: 'info',
        label: 'Te behandelen',
      },
      [INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]: {
        skin: 'warning',
        label: 'Klaar voor vergadering',
      },
    };

    this.statusPillSkin = uriLabelMap[status.uri].skin;
    this.statusPillLabel = uriLabelMap[status.uri].label;
  });

  setNextStatus = task(async () => {
    const currentStatus = await this.model.installatievergadering.status;
    const findStatusForUri = (uri) => {
      return this.model.ivStatuses.find((s) => s.uri === uri);
    };

    const nextStatusFor = {
      [INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS]: {
        status: findStatusForUri(
          INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS
        ),
        label: 'Klaarzetten voor vergadering',
        icon: 'circle-step-3',
      },
      [INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]: {
        status: findStatusForUri(INSTALLATIEVERGADERING_BEHANDELD_STATUS),
        label: 'Voorbereiding afronden',
        icon: 'circle-step-4',
      },
      [INSTALLATIEVERGADERING_BEHANDELD_STATUS]: {
        status: null,
        label: 'Voorbereiding afgerond',
        icon: 'check',
      },
    };

    this.nextStatus = nextStatusFor[currentStatus.uri];
  });
}
