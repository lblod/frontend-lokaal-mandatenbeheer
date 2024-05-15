import Component from '@glimmer/component';

import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class MandatarissenMandatenAsLinks extends Component {
  @tracked mandatenAsLinks = A([]);

  setup = restartableTask(async () => {
    const mandatarissen = await this.args.persoon.isAangesteldAls;

    for (const mandataris of mandatarissen) {
      if (!mandataris.isActive) {
        continue;
      }

      const mandaat = await mandataris.bekleedt;
      const bestuursfunctie = await mandaat.bestuursfunctie;

      this.mandatenAsLinks.pushObject({
        label: bestuursfunctie.label,
        route: `mandatarissen.mandataris`,
        model: mandataris.id,
        isLast: mandatarissen.indexOf(mandataris) == mandatarissen.length - 1,
      });
    }
  });
}
