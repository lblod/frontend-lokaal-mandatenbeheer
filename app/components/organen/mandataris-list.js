import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class OrganenMandatarisListComponent extends Component {
  @tracked columns = A([]);

  constructor() {
    super(...arguments);
  }

  setupTable = restartableTask(async () => {
    this.setColumns();
  });

  setColumns() {
    this.columns.clear();
    const activeTitles = this.tableTitles.filter((title) => title.show);
    this.columns.pushObjects(activeTitles.map((title) => title.label));
  }

  get contextTitle() {
    return this.args.title ?? '';
  }

  get tableTitles() {
    return [
      { label: 'Voornaam', show: this.args.showVoornaam ?? false },
      { label: 'Naam', show: this.args.showNaam ?? false },
      { label: 'Fractie', show: this.args.showFractie ?? false },
      { label: 'Functie', show: this.args.showFunctie ?? false },
      { label: 'Rangorde', show: this.args.showRangorde ?? false },
      { label: 'Bevoegdheid', show: this.args.showBevoegdheid ?? false },
    ];
  }
}
