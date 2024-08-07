import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { NamedNode } from 'rdflib';

import {
  FORM_GRAPH,
  META_GRAPH,
  SOURCE_GRAPH,
} from 'frontend-lmb/utils/constants';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { VERKIEZINGEN_GENERATE_ROWS_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { FORM, RDF } from 'frontend-lmb/rdf/namespaces';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked form;
  @tracked forkingStore;
  @tracked graphs;
  @tracked sourceNode;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {
    this.graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };
    this.sourceNode = new NamedNode('http://generate-rows/sourceNode');
    const formDefinition = await getFormFrom(
      this.store,
      VERKIEZINGEN_GENERATE_ROWS_FORM_ID
    );
    this.forkingStore = new ForkingStore();
    this.forkingStore.parse(
      formDefinition.formTtl,
      this.graphs.formGraph,
      'text/turtle'
    );

    this.form = this.forkingStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      this.graphs.formGraph
    );
  });
}
