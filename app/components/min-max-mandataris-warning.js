import Component from '@glimmer/component';
import moment from 'moment';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
  MANDAAT_SCHEPEN_CODE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';
import { COLLEGE_ORGANEN_VOEREN_EN_RAND } from 'frontend-lmb/utils/well-known-ids';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function getMandaten() {
  return trackedFunction(async () => {
    const bestuursorgaan = this.args.bestuursorgaanInTijd;
    const mandaten = await bestuursorgaan.bevat;

    await Promise.all(
      mandaten.map(async (mandaat) => {
        return await mandaat.bestuursfunctie;
      })
    );
    return mandaten;
  });
}

export default class MinMaxMandatarisWarningComponent extends Component {
  @service store;
  @service features;
  @tracked currentIndex = 0;

  @use(getMandaten)
  getMandaten;

  @cached
  get mandaten() {
    return this.getMandaten?.value ?? [];
  }

  @cached
  get counts() {
    if (this.mandaten.length === 0) {
      return {};
    }
    let counts = {};
    const burgemeesterMandaat = this.mandaten.find((mandaat) => {
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
        this.dateToCheckFor.isBetween(start, einde, 'day', '[]') &&
        mandataris.get('status.uri') !== MANDATARIS_VERHINDERD_STATE
      ) {
        counts[targetMandaat] = counts[targetMandaat] + 1 || 1;
      }
    });
    return counts;
  }

  @cached
  get warningMessages() {
    if (this.mandaten.length === 0) {
      return [];
    }
    const warnings = [];
    this.mandaten.map((mandaat) => {
      const min = mandaat.minAantalHouders;
      let max = mandaat.maxAantalHouders;

      const label = mandaat.get('bestuursfunctie.label');
      const bestuursfunctieUri = mandaat.get('bestuursfunctie.uri');
      const isSchepen = bestuursfunctieUri === MANDAAT_SCHEPEN_CODE;
      const countFound = this.counts[mandaat.id];
      if (min && countFound < min) {
        let extraText = '';
        let mailTo = '';
        if (
          isSchepen &&
          !COLLEGE_ORGANEN_VOEREN_EN_RAND.includes(
            this.args.bestuursorgaanInTijd.id
          )
        ) {
          extraText = `Als uw bestuur heeft beslist om minder dan het maximale aantal schepenen te installeren, blijft dit lagere schepenaantal vast voor de hele legislatuur.`;
          mailTo = `mailto://lokaalmandatenbeheer@vlaanderen.be?subject=Wijziging Aantal Schepenen`;
        }
        warnings.push({
          mandaat,
          text: `Er moet${min > 1 ? 'en' : ''} minstens ${min} mandataris${min > 1 ? 'sen' : ''} zijn voor het mandaat ${label}, er werd${countFound == 1 ? '' : 'en'} er ${countFound} gevonden op ${this.dateToCheckFor.format('DD-MM-YYYY')}.\n\n${extraText}`,
          count: countFound,
          mailTo: mailTo,
        });
      }
      if (max && countFound > max) {
        warnings.push({
          mandaat,
          text: `Er ${max > 1 ? 'mogen' : 'mag'} maximaal ${max} mandataris${max > 1 ? 'sen' : ''} zijn voor het mandaat ${label}, er werd${countFound == 1 ? '' : 'en'} er ${countFound} gevonden op ${this.dateToCheckFor.format('DD-MM-YYYY')}.`,
          count: countFound,
          mailTo: '',
        });
      }
    });

    return warnings;
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
    if (!this.features.isEnabled('enable-mandataris-count-warnings')) {
      return null;
    }
    return this.warningMessages?.[this.currentIndex];
  }

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
