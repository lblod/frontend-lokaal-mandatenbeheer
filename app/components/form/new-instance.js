import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { v4 as uuid } from 'uuid';
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
import { notifyFormSavedSuccessfully } from 'frontend-lmb/utils/toasts';
import { loadFormInto } from 'frontend-lmb/utils/loadFormInto';
import { guidFor } from '@ember/object/internals';

export default class NewInstanceComponent extends Component {
  @service store;
  @service toaster;
  @service formDirtyState;

  @tracked sourceTriples;
  @tracked errorMessage;
  @tracked formInfo = null;
  formStore = null;
  savedTriples = null;
  formId = `form-${guidFor(this)}`;

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
    // TODO validation needs to be checked first before the form is actually saved
    const triples = this.sourceTriples;
    const definition = this.formInfo.definition;
    this.errorMessage = null;
    // post triples to backend
    const result = yield fetch(`/form-content/${definition.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        contentTtl: triples,
        instanceUri: this.formInfo.sourceNode.value,
      }),
    });

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

    notifyFormSavedSuccessfully(this.toaster);

    if (this.args.onCreate) {
      this.args.onCreate({
        instanceTtl: triples,
        instanceId: id,
      });
    }

    this.formDirtyState.markClean(this.formId);
  }

  @action
  async createInstance() {
    this.save.perform();
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  async onInit() {
    const form = this.args.form;
    const uri = `${form.prefix}${uuid()}`;
    const sourceTtl = this.args.buildSourceTtl
      ? this.args.buildSourceTtl(uri)
      : '';

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    loadFormInto(formStore, form, sourceTtl, graphs);

    if (this.args.buildMetaTtl) {
      const metaTtl = await this.args.buildMetaTtl();
      formStore.parse(metaTtl, META_GRAPH, 'text/turtle');
    }
    const sourceNode = new NamedNode(uri);

    if (this.args.prefillValues) {
      const storeOptions = {
        formGraph: graphs.formGraph,
        metaGraph: graphs.metaGraph,
        sourceGraph: graphs.sourceGraph,
        sourceNode,
        store: formStore,
      };
      await this.args.prefillValues(storeOptions);
    }

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );

    this.formInfo = {
      definition: form,
      formNode,
      formStore,
      graphs,
      sourceNode,
    };
    this.registerObserver(formStore);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.formDirtyState.markClean(this.formId);
  }

  registerObserver(formStore) {
    const onFormUpdate = () => {
      if (this.isDestroyed) {
        return;
      }

      this.sourceTriples = this.formInfo.formStore.serializeDataMergedGraph(
        this.formInfo.graphs.sourceGraph
      );

      if (this.savedTriples === null) {
        this.savedTriples = this.sourceTriples;
      }

      if (this.savedTriples === this.sourceTriples) {
        this.formDirtyState.markClean(this.formId);
      } else {
        this.formDirtyState.markDirty(this.formId);
      }
    };
    formStore.registerObserver(onFormUpdate);
    onFormUpdate();
  }
}
