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
    const triples = this.sourceTriples;
    const definition = this.model.definition;
    const instanceId = this.model.instanceId;
    this.errorMessage = null;
    // post triples to backend
    const result = yield fetch(
      `/form-content/${definition.id}/instances/${instanceId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          contentTtl: triples,
          instanceUri: this.model.sourceNode.value,
        }),
      }
    );

    if (!result.ok) {
      this.errorMessage =
        'Er ging iets mis bij het opslaan van het formulier. Probeer het later opnieuw.';
      return;
    }

    const { id } = yield result.json();

    if (!id) {
      this.errorMessage =
        'Het formulier werd niet correct opgeslagen. Probeer het later opnieuw.';
      return;
    }

    this.router.refresh();
  }

  @action
  async saveInstance() {
    this.save.perform();
  }
}
