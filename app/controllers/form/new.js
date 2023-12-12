import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';

export default class FormNewController extends Controller {
  @tracked sourceTriples;

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
    const triples = this.sourceTriples;
    const definition = this.model.definition;
    // post triples to backend
    yield fetch(`/form-content/${definition.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        contentTtl: triples,
      }),
    });
  }

  @action
  async createInstance() {
    this.save.perform();
  }
}
