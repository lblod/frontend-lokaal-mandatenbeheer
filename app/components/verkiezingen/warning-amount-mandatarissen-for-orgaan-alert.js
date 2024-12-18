import Component from '@glimmer/component';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task, timeout } from 'ember-concurrency';
import { consume } from 'ember-provide-consume-context';
import { MANDAAT_BURGEMEESTER_CODE } from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenWarningAmountMandatarissenForOrgaanAlertComponent extends Component {
  @consume('alert-group') alerts;
  @service store;

  @tracked mandaatValueMapping;
  @tracked warningMessages = A();
  @tracked possibleWarningIds;

  constructor() {
    super(...arguments);
    this.getMaxAnMinNumberForMandaten.perform();
  }

  get errorMessageMinId() {
    return `min`;
  }

  get errorMessageMaxId() {
    return `max`;
  }

  getMaxAnMinNumberForMandaten = task(async () => {
    if (!this.args.bestuursorgaanInTijd) {
      throw new Error('Geen bestuursorgaan meegegeven aan component.');
    }

    const mandaten = await this.store.query('mandaat', {
      'filter[bevat-in][:uri:]': this.args.bestuursorgaanInTijd.uri,
    });
    this.mandaatValueMapping = new Map();
    for (const mandaat of mandaten) {
      const bestuursfunctie = await mandaat.bestuursfunctie;
      if (bestuursfunctie.uri === MANDAAT_BURGEMEESTER_CODE) {
        continue;
      }
      this.mandaatValueMapping.set(mandaat.id, {
        label: bestuursfunctie.label,
        mandaatId: mandaat.id,
        min: mandaat.minAantalHouders,
        max: mandaat.maxAantalHouders,
      });
    }
    this.setPossibleWarningIds();
  });

  @action
  async updateMappingWithMessages() {
    if (
      !this.mandaatValueMapping ||
      this.getMaxAnMinNumberForMandaten.isRunning
    ) {
      // This could be better
      await timeout(250);
      await this.updateMappingWithMessages();
    }

    this.warningMessages.clear();

    await Promise.all(
      Array.from(
        this.mandaatValueMapping,
        // eslint-disable-next-line no-unused-vars
        async ([key, value]) => {
          if (!value.max) {
            return;
          }
          const totalForMandaat = this.args.mandatarissen.filter((m) => {
            return m.get('bekleedt.id') === key;
          }).length;
          if (totalForMandaat > value.max) {
            const message = `Teveel mandaten gevonden voor "${value.label}". (${totalForMandaat}/${value.max})`;
            this.warningMessages.pushObject({
              message: message,
              id: this.createAlertId(value.mandaatId, this.errorMessageMaxId),
            });
          }
          if (totalForMandaat < value.min) {
            const message = `Te weinig mandaten gevonden voor "${value.label}". (${totalForMandaat}/${value.min})`;
            this.warningMessages.pushObject({
              message: message,
              id: this.createAlertId(value.mandaatId, this.errorMessageMinId),
            });
          }
        }
      )
    );
    await this.onUpdate();
  }

  setPossibleWarningIds() {
    this.possibleWarningIds = Array.from(
      this.mandaatValueMapping,
      // eslint-disable-next-line no-unused-vars
      ([key, value]) => {
        return [
          this.createAlertId(value.mandaatId, this.errorMessageMinId),
          this.createAlertId(value.mandaatId, this.errorMessageMaxId),
        ];
      }
    ).flat();
  }

  createAlertId(mandaatId, minMaxId) {
    return `${mandaatId}-${minMaxId}`;
  }

  @action
  async onUpdate() {
    for (const id of this.possibleWarningIds) {
      const exists = this.alerts.findBy('id', id);
      if (exists) {
        this.alerts.removeObject(exists);
      }

      const warning = this.warningMessages.find((w) => w.id === id);
      if (!warning) {
        continue;
      }
      this.alerts.pushObject({
        id: warning.id,
        message: warning.message,
      });
    }
  }
}
