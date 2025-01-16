import Component from '@glimmer/component';
import moment from 'moment';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class MinMaxMandatarisWarningComponent extends Component {
  @service store;
  @tracked warningMessages;
  @tracked currentIndex = 0;

  constructor() {
    super(...arguments);
    this.setup.perform();
  }

  get dateToCheckFor() {
    const now = moment();
    if (
      this.args.bestuursorgaanInTijd.bindingEinde &&
      now.isAfter(this.args.bestuursorgaanInTijd.bindingEinde)
    ) {
      return moment(this.args.bestuursorgaanInTijd.bindingEinde);
    }
    return now;
  }

  get warningTitle() {
    return this.warningMessages?.length > 1
      ? `Waarschuwing (${this.currentIndex + 1} van ${this.warningMessages.length})`
      : 'Waarschuwing';
  }

  get currentWarningMessage() {
    return this.warningMessages?.[this.currentIndex];
  }

  // sadly had to work with restartable task and did-update here because making
  // this a getter recomputed this on every update of mandataris
  // which is a lot because of all the relations being loaded
  setup = restartableTask(async () => {
    this.currentIndex = 0;
    const warnings = [];
    const bestuursorgaan = this.args.bestuursorgaanInTijd;
    const mandaten = await bestuursorgaan.bevat;
    await Promise.all(
      mandaten.map(async (mandaat) => {
        return await mandaat.bestuursfunctie;
      })
    );
    const date = this.dateToCheckFor;
    let counts = {};
    const burgemeesterMandaat = mandaten.find((mandaat) => {
      return mandaat.get('bestuursfunctie.uri') === MANDAAT_BURGEMEESTER_CODE;
    });
    this.args.mandatarissen.forEach((m) => {
      const mandataris = m.mandataris;
      let targetMandaat = mandataris.bekleedt.id;
      if (
        mandataris.get('bekleedt.bestuursfunctie.uri') ===
        MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE
      ) {
        targetMandaat = burgemeesterMandaat.id;
      }
      const start = moment(mandataris.start);
      const einde = moment(mandataris.einde || '3000-01-01');
      if (
        date.isBetween(start, einde, 'day', '[]') &&
        mandataris.get('status.uri') !== MANDATARIS_VERHINDERD_STATE
      ) {
        counts[targetMandaat] = counts[targetMandaat] + 1 || 1;
      }
    });

    await Promise.all(
      mandaten.map(async (mandaat) => {
        const min = mandaat.minAantalHouders;
        const max = mandaat.maxAantalHouders;

        const label = (await mandaat.bestuursfunctie).label;

        const countFound = counts[mandaat.id];
        if (min && countFound < min) {
          warnings.push({
            mandaat,
            text: `Er moet${min > 1 ? 'en' : ''} minstens ${min} mandataris${min > 1 ? 'sen' : ''} zijn voor het mandaat ${label}, er werd${countFound == 1 ? '' : 'en'} er ${countFound} gevonden op ${date.format('DD-MM-YYYY')}.`,
            count: countFound,
          });
        }
        if (max && countFound > max) {
          warnings.push({
            mandaat,
            text: `Er ${max > 1 ? 'mogen' : 'mag'} maximaal ${max} mandataris${max > 1 ? 'sen' : ''} zijn voor het mandaat ${label}, er werd${countFound == 1 ? '' : 'en'} er ${countFound} gevonden op ${date.format('DD-MM-YYYY')}.`,
            count: countFound,
          });
        }
      })
    );

    this.warningMessages = warnings;
  });

  @action
  previousWarning() {
    const newIndex = this.currentIndex - 1;
    const length = this.warningMessages?.length || 1;
    if (newIndex < 0) {
      this.currentIndex = length - 1;
    } else {
      this.currentIndex = newIndex;
    }
  }
  @action
  nextWarning() {
    const newIndex = this.currentIndex + 1;
    const length = this.warningMessages?.length || 1;
    if (newIndex >= length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = newIndex;
    }
  }
}
