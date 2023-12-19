import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RDF, FORM } from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../utils/constants';

export default class FormInstanceRoute extends Route {
  @service store;
  async model(params) {
    const definition = this.modelFor('form');
    const { formDataTtl, instanceUri } = await this.retrieveFormInstance(
      definition.id,
      params.instance_id
    );

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    this.loadForm(definition, formStore, formDataTtl, graphs);

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );
    const sourceNode = new NamedNode(instanceUri);

    return {
      instance: instanceUri,
      definition,
      form: formNode,
      formStore,
      graphs,
      sourceNode,
    };
  }

  async loadForm(definition, store, instance, graphs) {
    store.parse(definition.formTtl, graphs.formGraph, 'text/turtle');
    store.parse(definition.metaTtl || '', graphs.metaGraph, 'text/turtle');
    store.parse(instance || '', graphs.sourceGraph, 'text/turtle');
  }

  async retrieveFormInstance(formId, id) {
    const response = await fetch(`/form-content/${formId}/instances/${id}`);
    const { formDataTtl, instanceUri } = await response.json();
    return { formDataTtl, instanceUri };
  }
}
