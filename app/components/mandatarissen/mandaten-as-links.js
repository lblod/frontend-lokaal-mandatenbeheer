import Component from '@glimmer/component';

import { A } from '@ember/array';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenMandatenAsLinks extends Component {
  @tracked mandatenAsLinks = A([]);

  setup = restartableTask(async () => {
    const mandatarissen = await this.args.persoon.isAangesteldAls;
    const activeMandatarissen = mandatarissen.filter((mandataris) =>
      mandataris.inSelectedBestuursperiode(this.args.bestuursperiode)
    );
    const foldedMandatarissen = await foldMandatarisses(
      null,
      activeMandatarissen
    );

    for (const foldedMandataris of foldedMandatarissen) {
      const mandataris = foldedMandataris.mandataris;
      const mandaat = await mandataris.bekleedt;
      const bestuursfunctie = await mandaat.bestuursfunctie;

      this.mandatenAsLinks.pushObject({
        label: bestuursfunctie.label,
        route: `mandatarissen.persoon.mandataris`,
        model: [this.args.persoon.id, mandataris.id],
      });
    }
  });
}
