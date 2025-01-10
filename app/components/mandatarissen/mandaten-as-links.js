import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenMandatenAsLinks extends Component {
  @tracked mandatenAsLinks = A([]);
  @service store;

  setup = restartableTask(async () => {
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

      this.mandatenAsLinks.pushObject({
        label: bestuursfunctie.label,
        route: `mandatarissen.persoon.mandataris`,
        model: [this.args.persoon.id, mandataris.id],
      });
    }
  });
}
