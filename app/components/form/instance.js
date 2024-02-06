import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { RDF, FORM } from '../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import {
  JSON_API_TYPE,
  FORM_GRAPH,
  META_GRAPH,
  SOURCE_GRAPH,
} from '../../utils/constants';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class InstanceComponent extends Component {
  @service store;

  @tracked sourceTriples;
  @tracked errorMessage;
  @tracked formInfo = null;
  formStore = null;

  constructor() {
    super(...arguments);
    this.onInit();
  }

  get initialized() {
    return this.formInfo !== null;
  }

  get isSaving() {
    return this.save.isRunning;
  }

  @keepLatestTask
  *save() {
    const triples = this.sourceTriples;
    const definition = this.formInfo.definition;
    const instanceId = this.formInfo.instanceId;
    this.errorMessage = null;
    // post triples to backend
    const result = yield fetch(
      `/form-content/${definition.id}/instances/${instanceId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          contentTtl: triples,
          instanceUri: this.formInfo.sourceNode.value,
        }),
      }
    );

    if (!result.ok) {
      this.errorMessage =
        'Er ging iets mis bij het opslaan van het formulier. Probeer het later opnieuw.';
      return;
    }

    const body = yield result.json();

    if (!body?.instance?.instanceUri) {
      this.errorMessage =
        'Het formulier werd niet correct opgeslagen. Probeer het later opnieuw.';
      return;
    }

    if (this.args.onSave) {
      this.args.onSave(body);
    }
  }

  @action
  async saveInstance() {
    this.save.perform();
  }

  async onInit() {
    const form = this.args.form;
    const instanceId = this.args.instanceId;
    const { formInstanceTtl, instanceUri } = await this.retrieveFormInstance(
      form.definition.id,
      instanceId
    );

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    this.loadForm(form.definition, formStore, formInstanceTtl, graphs);

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );
    const sourceNode = new NamedNode(instanceUri);

    this.formInfo = {
      instanceId,
      definition: form.definition,
      formNode,
      formStore,
      graphs,
      sourceNode,
    };

    this.registerObserver(formStore);
  }

  async loadForm(definition, store, sourceTtl, graphs) {
    store.parse(definition.formTtl, graphs.formGraph, 'text/turtle');
    store.parse(definition.metaTtl || '', graphs.metaGraph, 'text/turtle');
    store.parse(sourceTtl || '', graphs.sourceGraph, 'text/turtle');
  }

  async retrieveFormInstance(formId, id) {
    const response = await fetch(`/form-content/${formId}/instances/${id}`);
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { formInstanceTtl, instanceUri } = await response.json();
    return { formInstanceTtl, instanceUri };
  }

  registerObserver(formStore) {
    formStore.registerObserver(() => {
      this.sourceTriples = this.formInfo.formStore.serializeDataMergedGraph(
        this.formInfo.graphs.sourceGraph
      );
    });
  }
}
