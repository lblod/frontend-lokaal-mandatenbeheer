import Component from '@glimmer/component';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function setup() {
  return trackedFunction(async () => {
    const foldedMandatarissen = await foldMandatarisses(
      null,
      this.args.mandatarissen ?? []
    );
    const links = [];
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

          links.push({
            label: bestuursorgaan.naam,
            route: `organen.orgaan`,
            model: [bestuursorgaan.id],
          });
        }
      })
    );
    return links;
  });
}
export default class MandatarissenBestuursorganenAsLinks extends Component {
  @use(setup) links;

  get organenAsLinks() {
    return this.links?.value;
  }
}
