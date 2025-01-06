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
      await this.getMandatarissen()
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
    console.log(this.subRows);
  });

  async getMandatarissen() {
    return await this.store.query('mandataris', {
      'filter[is-bestuurlijke-alias-van][:id:]': this.args.persoon.id,
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        this.args.bestuursperiode.id,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bekleedt', 'bekleedt.bestuursfunctie'].join(','),
    });
  }

  get persoon() {
    return this.args.persoon;
  }

  get persoonDetailRoute() {
    return 'mandatarissen.persoon.mandaten';
  }

  get iconSubRowOpen() {
    return this.isSubRowOpen ? 'nav-down' : 'nav-up';
  }

  get styleClassesSubRow() {
    return 'au-u-padding-top-small au-u-padding-bottom-small';
  }
}
