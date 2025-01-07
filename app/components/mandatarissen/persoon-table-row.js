import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenPersoonTableRowComponent extends Component {
  @service store;

  @tracked isSubRowOpen;
  @tracked subRows = A();

  getSubRowData = restartableTask(async () => {
    this.isSubRowOpen = !this.isSubRowOpen;

    if (this.isSubRowOpen === false) {
      this.subRows.clear();
      return;
    }
    const foldedMandatarissen = await foldMandatarisses(
      null,
      this.args.mandatarissen
    );
    await Promise.all(
      foldedMandatarissen.map(async (foldedMandataris) => {
        const mandataris = foldedMandataris.mandataris;
        const lidmaatschap = await mandataris.heeftLidmaatschap;
        const mandaat = await mandataris.bekleedt;
        const bestuursfunctie = await mandaat.bestuursfunctie;
        const bestuursorganenInTijd = await mandaat.bevatIn;
        let bestuursorgaan = null;
        if (bestuursorganenInTijd.length >= 1) {
          const bestuursorgaanInTijd = bestuursorganenInTijd.at(0);
          bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
        }

        this.subRows.pushObject({
          mandataris: mandataris,
          fractie: (await lidmaatschap.binnenFractie)?.naam ?? '',
          bestuursorgaan: {
            label: bestuursorgaan?.naam,
            routeModelId: bestuursorgaan?.id,
          },
          mandaat: {
            label: bestuursfunctie.label,
            routeModelIds: [this.args.persoon.id, mandataris.id],
          },
        });
      })
    );
  });

  get persoon() {
    return this.args.persoon;
  }

  get persoonDetailRoute() {
    return 'mandatarissen.persoon.mandaten';
  }

  get iconSubRowOpen() {
    return this.isSubRowOpen ? 'nav-up' : 'nav-down';
  }

  get styleClassesSubRow() {
    return 'au-u-padding-top-small au-u-padding-bottom-small';
  }
}
