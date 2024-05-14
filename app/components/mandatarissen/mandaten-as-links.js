import Component from '@glimmer/component';

import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class MandatarissenMandatenAsLinks extends Component {
  @tracked dataTree = A([]);

  setup = restartableTask(async () => {
    this.dataTree.clear();
    for (const mandataris of (await this.args.mandatarissen) ?? []) {
      const mandaat = await mandataris.bekleedt;
      console.log({ mandaat });

      this.dataTree.pushObject({
        bestuursfunctie: await mandaat.bestuursfunctie,
      });
    }
    console.log(this.dataTree);
  });
}
