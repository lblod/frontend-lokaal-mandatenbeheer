import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

import { RDF, FORM } from '../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../utils/constants';
import { task } from 'ember-concurrency';
import { notifyFormSavedSuccessfully } from 'frontend-lmb/utils/toasts';
import { loadFormInto } from 'frontend-lmb/utils/loadFormInto';
import { isValidForm } from 'frontend-lmb/utils/is-valid-form';

export default class InstanceComponent extends Component {
  @service store;
  @service toaster;
  @service formDirtyState;
  @service formRepository;

  @tracked sourceTriples;
  @tracked errorMessage;
  @tracked formInfo = null;
  @tracked hasChanges = false;
  @tracked forceShowErrors = false;
  @tracked isSaveHistoryModalOpen = false;
  @tracked showEditButtons = false;

  formStore = null;
  savedTriples = null;
  formId = `form-${guidFor(this)}`;

  historyMessage;

  constructor() {
    super(...arguments);
    this.setupFormForTtl.perform();
  }

  save = task({ keepLatest: true }, async () => {
    const ttlCode = this.sourceTriples;
    const instanceId = this.formInfo.instanceId;
    this.errorMessage = null;

    const result = await this.formRepository.updateFormInstance(
      instanceId,
      this.formInfo.sourceNode.value,
      this.formInfo.definition.id,
      ttlCode,
      this.historyMessage
    );

    if (result.errorMessage) {
      this.errorMessage = result.errorMessage;
      return;
    }

    // Success
    notifyFormSavedSuccessfully(this.toaster);

    if (this.args.onSave) {
      this.args.onSave({
        instanceId,
        instanceTtl: ttlCode,
        response: result.body,
      });
    }

    this.formDirtyState.markClean(this.formId);
    this.hasChanges = false;
    this.isSaveHistoryModalOpen = false;
  });

  @action
  async tryOpenHistoryModal() {
    const isValid = isValidForm(this.formInfo);
    this.forceShowErrors = !isValid;
    if (!isValid) {
      this.errorMessage =
        'Niet alle velden zijn correct ingevuld. Gelieve deze eerst te corrigeren.';
      return;
    }
    this.isSaveHistoryModalOpen = true;
  }

  @action
  updateHistoryMessage(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.historyMessage = event.target.value.trim();
  }

  @action
  async onRestore(historicalInstance) {
    this.formInfo = null;
    this.setupFormForTtl.perform(historicalInstance.formInstanceTtl);
  }

  setupFormForTtl = task(async (newFormTtl = null) => {
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
  });

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
    this.formInfo?.formStore?.clearObservers();
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
    this.args.formInitialized ? this.args.formInitialized() : null;
    this.showEditButtons = true;
  }
}
