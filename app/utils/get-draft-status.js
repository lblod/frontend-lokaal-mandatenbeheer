import { queryRecord } from './query-record';
import { MANDATARIS_DRAFT_STATE } from './well-known-uris';

export const getDraftStatus = async () => {
  return await queryRecord(this.store, 'mandataris-publication-status', {
    'filter[:uri:]': MANDATARIS_DRAFT_STATE,
  });
};
