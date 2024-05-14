import RdfInputFieldsConceptSchemeMultiSelectorWithCreateComponent from './concept-scheme-multi-selector-with-create';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { inject as service } from '@ember/service';
import { getByUri } from 'frontend-lmb/utils/get-by-uri';
import { tracked } from '@glimmer/tracking';

export default class RdfBeleidsdomeinCodeSelector extends RdfInputFieldsConceptSchemeMultiSelectorWithCreateComponent {
  @service store;
  @tracked shouldRender;

  constructor() {
    super(...arguments);
    this.registerObserver();
  }

  registerObserver() {
    const onFormUpdate = () => {
      if (this.isDestroyed) {
        return;
      }

      this.checkIfShouldRender();
    };
    this.storeOptions.store.registerObserver(onFormUpdate);
    onFormUpdate();
  }

  async checkIfShouldRender() {
    const mandaatUri = this.storeOptions.store.match(
      this.storeOptions.sourceNode,
      ORG('holds'),
      undefined,
      this.storeOptions.sourceGraph
    );

    const mandaat = await getByUri(
      this.store,
      'mandaat',
      mandaatUri[0]?.object?.value,
      { include: 'bestuursfunctie' }
    );
    this.shouldRender = mandaat?.isBurgemeester || mandaat?.isSchepen;

    if (!this.shouldRender && this.selected?.length > 0) {
      // without timeout, the form ttl doesn't update immediately
      setTimeout(() => {
        this.selected = [];
        // clear selection
        const matches = triplesForPath(this.storeOptions, true).values;

        // Cleanup old value(s) in the store
        matches.forEach((m) =>
          updateSimpleFormValue(this.storeOptions, undefined, m)
        );
      }, 100);
    }
  }
}
