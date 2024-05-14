import { queryRecord } from './query-record';
import {
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_EFFECTIEF_STATE,
} from './well-known-uris';

export const getEffectiefStatus = async (store) => {
  return await queryRecord(store, 'mandataris-status-code', {
    'filter[:uri:]': MANDATARIS_EFFECTIEF_STATE,
  });
};

export const getDraftPublicationStatus = async (store) => {
  return await queryRecord(store, 'mandataris-publication-status-code', {
    'filter[:uri:]': MANDATARIS_DRAFT_PUBLICATION_STATE,
  });
};
