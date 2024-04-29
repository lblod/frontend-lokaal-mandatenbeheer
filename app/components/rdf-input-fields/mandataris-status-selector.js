import { queryRecord } from 'frontend-lmb/utils/query-record';
import ConceptSchemeSelectorComponent from './concept-selector';
import { MANDATARIS_AANGEWEZEN_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class RdfInputFieldsMandatarisStatusSelectorComponent extends ConceptSchemeSelectorComponent {
  async fetchOptions(searchData) {
    const statuses = await super.fetchOptions(searchData);
    const mandatarisUri = this.storeOptions.sourceNode.value;
    const mandataris = await queryRecord(this.store, 'mandataris', {
      'filter[:uri:]': mandatarisUri,
    });
    const isBurgemeester = (await (await mandataris.bekleedt).bestuursfunctie)
      .isBurgemeester;

    if (isBurgemeester) {
      return statuses;
    }

    return statuses.filter(
      (status) => status.subject.value !== MANDATARIS_AANGEWEZEN_STATE
    );
  }
}
