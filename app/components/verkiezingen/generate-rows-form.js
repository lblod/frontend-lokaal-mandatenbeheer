import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, restartableTask } from 'ember-concurrency';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked formInfo;
  @tracked showErrors;
  @tracked isFormValid;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {});

  onConfigReady = restartableTask(async () => {
    this.args.onConfigReceived({
      rows: 0,
      startDate: null,
    });
  });
}
