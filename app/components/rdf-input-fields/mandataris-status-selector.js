import { queryRecord } from 'frontend-lmb/utils/query-record';
import ConceptSchemeSelectorComponent from './concept-selector';
import { MANDATARIS_AANGEWEZEN_STATE } from 'frontend-lmb/utils/well-known-uris';
import { tracked } from '@glimmer/tracking';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { service } from '@ember/service';

export default class RdfInputFieldsMandatarisStatusSelectorComponent extends ConceptSchemeSelectorComponent {
  @service store;

  @tracked mandaat = null;

  async loadMandaat() {
    const forkingStore = this.storeOptions.store;
    const mandaatUri = forkingStore.any(
      this.storeOptions.sourceNode,
      ORG('holds'),
      null,
      this.storeOptions.sourceGraph
    )?.value;

    if (!mandaatUri || this.mandaat?.uri === mandaatUri) {
      return;
    }

    this.mandaat = await queryRecord(this.store, 'mandaat', {
      'filter[:uri:]': mandaatUri,
    });

    this.options = await this.fetchOptions();
  }

  registerObserver() {
    const onFormUpdate = async () => {
      if (this.isDestroyed) {
        return;
      }

      await this.loadMandaat();
    };
    this.storeOptions.store.registerObserver(onFormUpdate);
    onFormUpdate();
  }

  constructor() {
    super(...arguments);
    this.loadMandaat();
    this.registerObserver();
  }

  async fetchOptions(searchData) {
    const statuses = await super.fetchOptions(searchData);
    const isBurgemeester = (await this.mandaat?.bestuursfunctie)
      ?.isBurgemeester;

    if (isBurgemeester) {
      return statuses;
    }

    return statuses.filter(
      (status) => status.subject.value !== MANDATARIS_AANGEWEZEN_STATE
    );
  }
}
