import Component from '@glimmer/component';

import { task } from 'ember-concurrency';

export default class GenerateRowsFormComponent extends Component {
  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {});

  generateMandatarissen = task(async (config) => {
    const { rows, mandaat } = config;
    console.log({ rows });
    console.log({ mandaat });
  });
}
