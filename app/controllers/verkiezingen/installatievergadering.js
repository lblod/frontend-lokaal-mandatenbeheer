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
export default class PrepareInstallatievergaderingController extends Controller {
  queryParams = ['bestuursperiode'];
  @service store;
  @service router;
  @service installatievergadering;

  @tracked bestuursperiode;
  @tracked statusPillSkin = 'info';
  @tracked statusPillLabel = 'info';
  @tracked nextStatus;
  @tracked isModalOpen = false;
  @tracked verkiezingsUitslagModal = false;
  @tracked nextStatusSetting = false;

  @action
  async selectStatus(status) {
    this.nextStatusSetting = true;
    const installatievergadering = this.model.installatievergadering;

    if (status.uri === INSTALLATIEVERGADERING_BEHANDELD_STATUS) {
      await fetch(
        `/installatievergadering-api/${installatievergadering.id}/move-ocmw-organs`,
        { method: 'POST' }
      );
    }
    this.isModalOpen = false;
    installatievergadering.status = status;
    await installatievergadering.save();
    this.nextStatusSetting = false;

    this.router.refresh();
  }

  get statusTooltip() {
    if (!this.nextStatus) {
      return 'De installatievergadering is reeds afgerond.';
    }
    return 'De installatievergadering kan pas afgerond worden wanneer ze heeft plaatsgevonden. Deze functionaliteit wordt vanaf december opengesteld.';
  }

  get statusIsDisabled() {
    return !this.nextStatus?.status;
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

    this.statusPillSkin = uriLabelMap[status.uri].skin;
    this.statusPillLabel = uriLabelMap[status.uri].label;
  });

  get modalTitle() {
    if (
      this.model.installatievergadering.get('status.uri') ===
      INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS
    ) {
      return 'Klaarzetten in notuleringspakket';
    } else {
      return 'Voorbereiding afronden';
    }
  }

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
        modalMessage:
          'Ben je klaar met de voorbereiding? Als je naar de volgende status gaat wordt deze beschikbaar gemaakt voor een compatibel notuleringspakket.',
        statusPillLabel:
          uriLabelMap[INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]
            .label,
        statusPillSkin:
          uriLabelMap[INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]
            .skin,
      },
      [INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS]: {
        status: findStatusForUri(INSTALLATIEVERGADERING_BEHANDELD_STATUS),
        label: 'Voorbereiding afronden',
        icon: 'circle-step-4',
        modalMessage:
          'Door naar de volgende status te gaan wordt de voorbereiding afgesloten en zal je de deze niet meer kunnen bewerken. Doe dit dus enkel wanneer de installatievergadering voorbij is en ingegeven is in het notuleringspakket.',
        statusPillLabel:
          uriLabelMap[INSTALLATIEVERGADERING_BEHANDELD_STATUS].label,
        statusPillSkin:
          uriLabelMap[INSTALLATIEVERGADERING_BEHANDELD_STATUS].skin,
      },
      [INSTALLATIEVERGADERING_BEHANDELD_STATUS]: {
        status: null,
        label: 'Voorbereiding afgerond',
        icon: 'check',
      },
    };

    this.nextStatus = nextStatusFor[currentStatus.uri];
  });
  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  @action
  onUpdateBurgemeester() {
    this.installatievergadering.forceRecomputeBCSD();
    this.router.refresh();
  }
}
