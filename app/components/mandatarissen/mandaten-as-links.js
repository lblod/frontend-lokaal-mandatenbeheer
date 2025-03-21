import Component from '@glimmer/component';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function setup() {
  return trackedFunction(async () => {
    const links = [];
    const foldedMandatarissen = await foldMandatarisses(
      null,
      this.args.mandatarissen ?? []
    );

    for (const foldedMandataris of foldedMandatarissen) {
      const mandataris = foldedMandataris.mandataris;
      const mandaat = await mandataris.bekleedt;

      if (!(await mandaat.isDecretaal)) {
        continue;
      }

      const bestuursfunctie = await mandaat.bestuursfunctie;

      links.push({
        label: bestuursfunctie.label,
        route: `mandatarissen.persoon.mandataris`,
        model: [this.args.persoon.id, mandataris.id],
      });
    }

    return links;
  });
}

export default class MandatarissenMandatenAsLinks extends Component {
  @use(setup) links;

  get mandatenAsLinks() {
    return this.links?.value;
  }
}
