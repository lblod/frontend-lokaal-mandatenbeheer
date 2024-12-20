import Component from '@glimmer/component';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';
import { consume } from 'ember-provide-consume-context';
import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
  MANDAAT_LID_VAST_BUREAU_CODE,
} from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenMandateesInOrgaanAlertComponent extends Component {
  @consume('alert-group') alerts;
  @service store;

  @tracked mandaatValueMapping;
  @tracked warningMessages = A();
  alertId = 'mandatees-min-max';

  get errorMessageMinId() {
    return `min`;
  }

  get errorMessageMaxId() {
    return `max`;
  }

  @action
  async getMinAndMaxNumberForMandaten() {
    if (!this.args.bestuursorgaanInTijd) {
      throw new Error('Geen bestuursorgaan meegegeven aan component.');
    }

    const mandaten = await this.store.query('mandaat', {
      'filter[bevat-in][:uri:]': this.args.bestuursorgaanInTijd.uri,
    });
    this.mandaatValueMapping = {};
    await Promise.all(
      mandaten.map(async (mandaat) => {
        const bestuursfunctie = await mandaat.bestuursfunctie;
        const functieCodesToExclude = [
          MANDAAT_BURGEMEESTER_CODE,
          MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
        ];
        // because of toegevoegde schepen
        const hasOneExtraCodes = [MANDAAT_LID_VAST_BUREAU_CODE];
        if (functieCodesToExclude.includes(bestuursfunctie.uri)) {
          return;
        }
        let maxBonus = 0;
        if (hasOneExtraCodes.includes(bestuursfunctie.uri)) {
          maxBonus = 1;
        }
        this.mandaatValueMapping[mandaat.id] = {
          label: bestuursfunctie.label,
          mandaatId: mandaat.id,
          min: mandaat.minAantalHouders,
          max: mandaat.maxAantalHouders + maxBonus,
        };
      })
    );
    this.updateMappingWithMessages.perform();
  }

  updateMappingWithMessages = restartableTask(async () => {
    this.warningMessages.clear();
    await Promise.all(
      Object.entries(this.mandaatValueMapping || {}).map(
        async ([key, value]) => {
          if (!value.max) {
            return;
          }
          const totalForMandaat = this.args.mandatarissen.filter((m) => {
            return m.get('bekleedt.id') === key;
          }).length;
          const persoonNameMap = {};
          const duplicates = [];
          this.args.mandatarissen.forEach((mandataris) => {
            if (mandataris.get('bekleedt.id') !== key) {
              return;
            }
            const persoonId = mandataris.get('isBestuurlijkeAliasVan.id');
            const persoonName = `${mandataris.get('isBestuurlijkeAliasVan.naam')}`;
            if (persoonId && persoonNameMap[persoonId]) {
              duplicates.push(persoonName);
            }
            persoonNameMap[persoonId] = persoonName;
          });
          if (duplicates.length > 0) {
            const message = `Er zijn personen die hetzelfde mandaat meerdere keren opnemen: ${duplicates.join(', ')}.`;
            this.warningMessages.pushObject({
              message: message,
              id: this.alertId,
            });
          }
          if (totalForMandaat > value.max) {
            const message = `Te veel mandaten gevonden voor "${value.label}". (${totalForMandaat}/${value.max})`;
            this.warningMessages.pushObject({
              message: message,
              id: this.alertId,
            });
          }
          if (totalForMandaat < value.min) {
            const message = `Te weinig mandaten gevonden voor "${value.label}". (${totalForMandaat}/${value.min})`;
            this.warningMessages.pushObject({
              message: message,
              id: this.alertId,
            });
          }
        }
      )
    );
    await this.onUpdate();
  });

  @action
  async onUpdate() {
    const existing = this.alerts.filterBy('id', this.alertId);
    // we have multiple possible warnings, one for each mandate with min/max
    existing.forEach((item) => {
      this.alerts.removeObject(item);
    });

    this.warningMessages.forEach((warning) => {
      this.alerts.pushObject({
        id: this.alertId,
        message: warning.message,
      });
    });
  }
}
