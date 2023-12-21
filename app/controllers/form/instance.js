import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class FormInstanceController extends Controller {
  @tracked sourceTriples;
  @tracked errorMessage;
  @service router;

  registerObserver() {
    this.model.formStore.registerObserver(() => {
      this.sourceTriples = this.model.formStore.serializeDataMergedGraph(
        this.model.graphs.sourceGraph
      );
    });
  }

  get isSaving() {
    return this.save.isRunning;
  }

  @keepLatestTask
  *save() {
    // TODO
  }

  @action
  async saveInstance() {
    this.save.perform();
  }
}
