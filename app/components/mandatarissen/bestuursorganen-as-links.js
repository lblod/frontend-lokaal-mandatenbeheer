import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenBestuursorganenAsLinks extends Component {
  @tracked organenAsLinks = A([]);
  @service store;

  setup = restartableTask(async () => {
    const mandatarissen = await this.store.query('mandataris', {
      'filter[is-bestuurlijke-alias-van][:id:]': this.args.persoon.id,
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        this.args.bestuursperiode.id,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bekleedt', 'bekleedt.bestuursfunctie'].join(','),
    });

    const foldedMandatarissen = await foldMandatarisses(null, mandatarissen);

    await Promise.all(
      foldedMandatarissen.map(async (foldedMandataris) => {
        const mandataris = foldedMandataris.mandataris;
        const mandaat = await mandataris.bekleedt;

        if (!(await mandaat.isDecretaal)) {
          return null;
        }

        const bestuursorganenInTijd = await mandaat.bevatIn;
        for (const bestuursorgaanInTijd of bestuursorganenInTijd) {
          const bestuursorgaan =
            await bestuursorgaanInTijd.isTijdsspecialisatieVan;

          this.organenAsLinks.pushObject({
            label: bestuursorgaan.naam,
            route: `organen.orgaan`,
            model: [bestuursorgaan.id],
          });
        }
      })
    );
  });
}
