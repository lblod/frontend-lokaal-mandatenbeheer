import { queryRecord } from './query-record';
import { MANDATARIS_DRAFT_STATE } from './well-known-uris';

export const getDraftStatus = async (store) => {
  return await queryRecord(store, 'mandataris-publication-status-code', {
    'filter[:uri:]': MANDATARIS_DRAFT_STATE,
  });
};
