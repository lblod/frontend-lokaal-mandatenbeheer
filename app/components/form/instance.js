import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { RDF, FORM } from '../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import {
  ForkingStore,
  validateForm,
} from '@lblod/ember-submission-form-fields';
import {
  JSON_API_TYPE,
  FORM_GRAPH,
  META_GRAPH,
  SOURCE_GRAPH,
  RESOURCE_CACHE_TIMEOUT,
} from '../../utils/constants';
import { inject as service } from '@ember/service';
import { keepLatestTask, timeout } from 'ember-concurrency';
import { notifyFormSavedSuccessfully } from 'frontend-lmb/utils/toasts';
import { loadFormInto } from 'frontend-lmb/utils/loadFormInto';
import { guidFor } from '@ember/object/internals';

export default class InstanceComponent extends Component {
  @service store;
  @service toaster;
  @service formDirtyState;

  @tracked sourceTriples;
  @tracked errorMessage;
  @tracked formInfo = null;
  @tracked hasChanges = false;
  @tracked forceShowErrors = false;
  @tracked isSaveHistoryModalOpen = false;

  formStore = null;
  savedTriples = null;
  formId = `form-${guidFor(this)}`;

  historyMessage;

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

  get isEditable() {
    if (this.args.isEditable === undefined) {
      return true;
    }
    return Boolean(this.args.isEditable);
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
          description: this.historyMessage,
        }),
      }
    );

    yield timeout(RESOURCE_CACHE_TIMEOUT);

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

    // Success
    notifyFormSavedSuccessfully(this.toaster);

    if (this.args.onSave) {
      this.args.onSave({
        instanceId,
        instanceTtl: triples,
        response: body,
      });
    }

    this.formDirtyState.markClean(this.formId);
    this.hasChanges = false;
  }

  @action
  async tryOpenHistoryModal() {
    if (!this.validate()) {
      this.errorMessage =
        'Niet alle velden zijn correct ingevuld. Probeer het later opnieuw.';
      return;
    }
    this.isSaveHistoryModalOpen = true;
  }

  @action
  async saveInstance() {
    this.save.perform();
  }

  @action
  updateHistoryMessage(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.historyMessage = event.target.value.trim();
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  @action
  async onRestore(historicalInstance) {
    this.formInfo = null;
    this.onInit(historicalInstance.formInstanceTtl);
  }

  async onInit(newFormTtl = null) {
    const form = this.args.form;
    const instanceId = this.args.instanceId;

    const { formInstanceTtl, instanceUri } = await this.retrieveFormInstance(
      form.id,
      instanceId
    );

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    loadFormInto(formStore, form, newFormTtl || formInstanceTtl, graphs);

    if (this.args.buildMetaTtl) {
      const metaTtl = await this.args.buildMetaTtl();
      formStore.parse(metaTtl, META_GRAPH, 'text/turtle');
    }

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );
    const sourceNode = new NamedNode(instanceUri);

    this.formInfo = {
      instanceId,
      definition: form,
      formNode,
      formStore,
      graphs,
      sourceNode,
    };

    this.registerObserver(formStore);
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

  willDestroy() {
    super.willDestroy(...arguments);
    this.formDirtyState.markClean(this.formId);
  }

  @action
  validate() {
    const hasNoErrors = validateForm(this.formInfo.formNode, {
      ...this.formInfo.graphs,
      sourceNode: this.formInfo.sourceNode,
      store: this.formInfo.formStore,
    });

    this.forceShowErrors = !hasNoErrors;
    return hasNoErrors;
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
        this.hasChanges = false;
      } else {
        this.formDirtyState.markDirty(this.formId);
        this.hasChanges = true;
      }
    };
    formStore.registerObserver(onFormUpdate);
    onFormUpdate();
  }
}
