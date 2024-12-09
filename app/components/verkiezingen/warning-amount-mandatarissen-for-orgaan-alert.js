import Component from '@glimmer/component';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';

export default class VerkiezingenWarningAmountMandatarissenForOrgaanAlertComponent extends Component {
  @service store;

  @tracked mandaatValueMapping;
  @tracked warningMessages = A();

  constructor() {
    super(...arguments);
    this.getMaxAnMinNumberForMandaten.perform();
  }

  getMaxAnMinNumberForMandaten = task(async () => {
    if (!this.args.bestuursorgaanInTijd) {
      return;
    }

    const mandaten = await this.store.query('mandaat', {
      'filter[bevat-in][:uri:]': this.args.bestuursorgaanInTijd.uri,
    });
    this.mandaatValueMapping = new Map();
    for (const mandaat of mandaten) {
      this.mandaatValueMapping.set(mandaat.id, {
        label: (await mandaat.bestuursfunctie).label,
        min: mandaat.minAantalHouders,
        max: mandaat.maxAantalHouders,
        warning: null,
      });
    }
    await this.updateMappingWithMessages();
  });

  @action
  async updateMappingWithMessages() {
    await Promise.all(
      Array.from(
        this.mandaatValueMapping ?? [],
        // eslint-disable-next-line no-unused-vars
        async ([key, value]) => {
          if (!value.max) {
            return;
          }
          const totalForMandaat = this.args.mandatarissen.filter((m) => {
            return m.get('bekleedt.id') === key;
          }).length;
          if (totalForMandaat > value.max) {
            this.setMessageForMandaat(
              key,
              `Teveel mandatarissen gevonden voor mandaat ${value.label} (${totalForMandaat} van ${value.max})`
            );
          } else {
            this.setMessageForMandaat(key, null);
          }
        }
      )
    );
    this.warningMessages.clear();
    this.warningMessages.pushObjects(
      Array.from(
        this.mandaatValueMapping ?? [],
        // eslint-disable-next-line no-unused-vars
        ([key, value]) => value.message
      ).filter((m) => m)
    );
  }

  setMessageForMandaat(mandaatId, message) {
    if (!mandaatId) {
      return;
    }

    const current = this.mandaatValueMapping.get(mandaatId);
    delete current.message;
    this.mandaatValueMapping.set(mandaatId, {
      ...current,
      message,
    });
  }

  @action
  next() {
    const current = this.warningMessages.shiftObject();
    this.warningMessages.pushObject(current);
  }

  @action
  previous() {
    const current = this.warningMessages.popObject();
    this.warningMessages.unshiftObject(current);
  }

  get currentShownWarning() {
    return this.warningMessages.at(0) ?? null;
  }

  get hasMoreThanOneMessage() {
    return this.warningMessages.length > 1;
  }
}
