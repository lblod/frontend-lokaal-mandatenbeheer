import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RDF, FORM } from '../../rdf/namespaces';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM_GRAPH, META_GRAPH, SOURCE_GRAPH } from '../../utils/constants';

export default class FormInstanceRoute extends Route {
  @service store;
  async model(params) {
    const formModel = this.modelFor('form');
    return { form: formModel, instanceId: params.instance_id };
  }
}
