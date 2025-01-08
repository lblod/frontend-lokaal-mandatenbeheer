import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenPersoonTableRowComponent extends Component {
  @service store;

  @tracked isSubRowOpen;
  @tracked subRows = A();

  @action
  openCloseSubRows() {
    this.isSubRowOpen = !this.isSubRowOpen;
  }

  @action
  async getSubRowData() {
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
        let fractieLabel = null;

        if (bestuursorganenInTijd.length >= 1) {
          const bestuursorgaanInTijd = bestuursorganenInTijd.at(0);
          bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
        }
        if (!lidmaatschap) {
          fractieLabel = 'Niet beschikbaar';
        } else {
          fractieLabel = (await lidmaatschap.binnenFractie)?.naam;
        }

        this.subRows.pushObject({
          mandataris: mandataris,
          fractie: fractieLabel,
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
  }

  get persoonDetailRoute() {
    return 'mandatarissen.persoon.mandaten';
  }

  get iconSubRowOpen() {
    return this.isSubRowOpen ? 'nav-up' : 'nav-down';
  }

  get firstSubRow() {
    return this.subRows?.firstObject;
  }
}
