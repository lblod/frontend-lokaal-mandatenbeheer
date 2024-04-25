import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class OrganenMandatarisListComponent extends Component {
  @tracked columns = A([]);
  @tracked rows = A([]);

  constructor() {
    super(...arguments);
  }

  setupTable = restartableTask(async () => {
    this.setColumns();
    await this.setRows();
  });

  setColumns() {
    this.columns.clear();
    const activeTitles = this.tableTitles.filter((title) => title.show);
    this.columns.pushObjects(activeTitles.map((title) => title.label));
  }

  async setRows() {
    this.rows.clear();
    this.rows.pushObjects(
      this.mandatarissen.map((mandatarisData) => {
        return mandatarisData;
      })
    );
  }

  get mandatarissen() {
    return this.args.mandatarissen ?? [];
  }

  get rowPlaceholders() {
    return this.columns.map(() => null);
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
      { label: 'Start mandaat', show: this.args.showStartMandaat ?? false },
      { label: 'Einde mandaat', show: this.args.showEindeMandaat ?? false },
    ];
  }
}
