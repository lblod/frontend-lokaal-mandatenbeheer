import Component from '@glimmer/component';

import { A } from '@ember/array';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenMandatenAsLinks extends Component {
  @tracked mandatenAsLinks = A([]);

  setup = restartableTask(async () => {
    const mandatarissen = await this.args.persoon.isAangesteldAls;
    const activeMandatarissen = mandatarissen.filter(
      (mandataris) => mandataris.isActive
    );

    for (const mandataris of activeMandatarissen) {
      const mandaat = await mandataris.bekleedt;
      const bestuursfunctie = await mandaat.bestuursfunctie;

      this.mandatenAsLinks.pushObject({
        label: bestuursfunctie.label,
        route: `mandatarissen.persoon.mandataris`,
        model: [this.args.persoon.id, mandataris.id],
        isLast:
          activeMandatarissen.indexOf(mandataris) ==
          activeMandatarissen.length - 1,
      });
    }
  });
}
