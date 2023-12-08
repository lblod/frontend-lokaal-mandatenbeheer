import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class FormNewController extends Controller {
  @tracked sourceTriples;

  registerObserver() {
    this.model.formStore.registerObserver(() => {
      this.sourceTriples = this.model.formStore.serializeDataMergedGraph(
        this.model.graphs.sourceGraph
      );
    });
  }
}
