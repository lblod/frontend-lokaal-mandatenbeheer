import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, restartableTask } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';

import {
  FORM_GRAPH,
  META_GRAPH,
  SOURCE_GRAPH,
} from 'frontend-lmb/utils/constants';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { VERKIEZINGEN_GENERATE_ROWS_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { EXT, FORM, RDF } from 'frontend-lmb/rdf/namespaces';
import { isValidForm } from 'frontend-lmb/utils/is-valid-form';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked formInfo;
  @tracked showErrors;
  @tracked isFormValid;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {
    const graphs = {
      formGraph: FORM_GRAPH,
      metaGraph: META_GRAPH,
      sourceGraph: SOURCE_GRAPH,
    };
    const formDefinition = await getFormFrom(
      this.store,
      VERKIEZINGEN_GENERATE_ROWS_FORM_ID
    );
    const builderStore = new ForkingStore();
    builderStore.parse(formDefinition.formTtl, graphs.formGraph, 'text/turtle');

    this.formInfo = {
      form: builderStore.any(
        undefined,
        RDF('type'),
        FORM('Form'),
        graphs.formGraph
      ),
      formStore: builderStore,
      graphs,
      sourceNode: EXT('source'),
    };
  });

  onConfigReady = restartableTask(async () => {
    this.showErrors = !isValidForm(this.formInfo);
    if (this.showErrors) {
      return;
    }

    this.args.onConfigReceived({
      rows: this.getFieldValue('rows'),
      startDate: this.getFieldValue('startDate'),
    });
  });

  getFieldValue(predicate) {
    return this.formInfo.formStore.any(
      this.formInfo.sourceNode,
      EXT(predicate),
      undefined,
      this.formInfo.graphs.sourceGraph
    )?.value;
  }
}
