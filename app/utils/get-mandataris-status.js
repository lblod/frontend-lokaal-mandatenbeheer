import { queryRecord } from './query-record';
import {
  MANDATARIS_EFFECTIEF_STATE,
  MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
} from './well-known-uris';

export const getEffectiefStatus = async (store) => {
  return await queryRecord(store, 'mandataris-status-code', {
    'filter[:uri:]': MANDATARIS_EFFECTIEF_STATE,
  });
};

export const getNietBekrachtigdPublicationStatus = async (store) => {
  return await queryRecord(store, 'mandataris-publication-status-code', {
    'filter[:uri:]': MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
  });
};
