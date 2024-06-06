import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

import { v4 as uuid } from 'uuid';
import { RDF, FORM } from '../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import {
  ForkingStore,
  validateForm,
} from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../utils/constants';
import { task } from 'ember-concurrency';
import { notifyFormSavedSuccessfully } from 'frontend-lmb/utils/toasts';
import { loadFormInto } from 'frontend-lmb/utils/loadFormInto';

export default class NewInstanceComponent extends Component {
  @service store;
  @service toaster;
  @service formDirtyState;
  @service formRepository;

  @tracked sourceTriples;
  @tracked errorMessage;
  @tracked formInfo = null;
  @tracked forceShowErrors = false;
  formStore = null;
  savedTriples = null;
  formId = `form-${guidFor(this)}`;

  constructor() {
    super(...arguments);
    this.setupNewForm.perform();
  }

  save = task({ keepLatest: true }, async () => {
    // TODO validation needs to be checked first before the form is actually saved
    const ttlCode = this.sourceTriples;
    this.errorMessage = null;

    if (!this.validate()) {
      this.errorMessage =
        'Niet alle velden zijn correct ingevuld. Probeer het later opnieuw.';
      return;
    }

    const result = await this.formRepository.createFormInstance(
      this.formInfo.sourceNode.value,
      this.formInfo.definition.id,
      ttlCode
    );

    if (result.errorMessage) {
      this.errorMessage = result.errorMessage;
      return;
    }

    // Success
    notifyFormSavedSuccessfully(this.toaster);

    if (this.args.onCreate) {
      this.args.onCreate({
        instanceTtl: ttlCode,
        instanceId: result.id,
      });
    }

    this.formDirtyState.markClean(this.formId);
  });

  @action
  async createInstance() {
    this.save.perform();
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  setupNewForm = task(async () => {
    const form = this.args.form;
    const uri = `${form.prefix}${uuid()}`;
    const sourceTtl = this.args.buildSourceTtl
      ? await this.args.buildSourceTtl(uri)
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
  });

  willDestroy() {
    super.willDestroy(...arguments);
    this.formDirtyState.markClean(this.formId);
  }

  validate() {
    const hasNoErrors = validateForm(this.formInfo.formNode, {
      ...this.formInfo.graphs,
      sourceNode: this.formInfo.sourceNode,
      store: this.formInfo.formStore,
    });

    this.forceShowErrors = !hasNoErrors;
    return hasNoErrors;
  }

  async registerObserver(formStore) {
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
    await timeout(55);
    this.args.formInitialized ? this.args.formInitialized() : null;
  }
}
