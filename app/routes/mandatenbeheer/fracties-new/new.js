import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RDF, FORM } from '../../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../../utils/constants';
import { v4 as uuid } from 'uuid';

export default class NewFractiesNewRoute extends Route {
  generateSourceTtl(instanceUri) {
    const mandatenbeheer = this.modelFor('mandatenbeheer');
    const bestuurseenheid = mandatenbeheer.bestuurseenheid;
    const bestuursorganen = mandatenbeheer.bestuursorganen;

    const bestuurseenheidUri = bestuurseenheid.get('uri');
    const bestuursOrganenUris = bestuursorganen.map((b) => `<${b.get('uri')}>`);

    return `<${instanceUri}> <http://www.w3.org/ns/org#memberOf> ${bestuursOrganenUris.join(
      ', '
    )} .
    <${instanceUri}> <http://www.w3.org/ns/org#linkedTo> <${bestuurseenheidUri}> . `;
  }

  @service store;
  async model() {
    const formModel = this.modelFor('mandatenbeheer.fracties-new');
    const uri = `${formModel.prefix}${uuid()}`;
    const sourceTtl = this.generateSourceTtl(uri);
    const instance = this.store.createRecord('form-instance', {
      definition: formModel.definition,
      sourceTtl: sourceTtl,
      uri,
    });

    const formStore = new ForkingStore();

    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };

    this.loadForm(formModel.definition, formStore, sourceTtl, graphs);

    const formNode = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPH
    );
    const sourceNode = new NamedNode(instance.uri);

    return {
      instance,
      definition: formModel.definition,
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

  async loadForm(definition, store, sourceTtl, graphs) {
    store.parse(definition.formTtl, graphs.formGraph, 'text/turtle');
    store.parse(definition.metaTtl || '', graphs.metaGraph, 'text/turtle');
    store.parse(sourceTtl || '', graphs.sourceGraph, 'text/turtle');
  }
}
