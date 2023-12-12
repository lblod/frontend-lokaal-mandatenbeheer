import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RDF, FORM } from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../utils/constants';
import { v4 as uuid } from 'uuid';

export default class FormNewRoute extends Route {
  @service store;
  async model() {
    const definition = this.modelFor('form');
    const instance = this.store.createRecord('form-instance', {
      definition: this.modelFor('form'),
      sourceTtl: '',
      // TODO allow forms to define their own prefix for uri generation: LMB-38
      uri: `http://data.lblod.info/form-data/instances/${uuid()}`,
    });

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    this.loadForm(definition, formStore, graphs);

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );
    const sourceNode = new NamedNode(instance.uri);

    return {
      instance,
      definition,
      form: formNode,
      formStore,
      graphs,
      sourceNode,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.registerObserver();
  }

  async loadForm(definition, store, graphs) {
    store.parse(definition.formTtl, graphs.formGraph, 'text/turtle');
    store.parse(definition.metaTtl || '', graphs.metaGraph, 'text/turtle');
  }
}
