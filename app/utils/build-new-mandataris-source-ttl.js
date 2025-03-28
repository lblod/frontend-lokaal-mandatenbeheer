import {
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
} from './well-known-uris';

export const buildNewMandatarisSourceTtl = async (
  store,
  instanceUri,
  personId
) => {
  const nietBekrachtigdTriple = `
    <${instanceUri}> <http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus> <${MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE}>.
  `;
  if (!personId) {
    return nietBekrachtigdTriple;
  }
  const person = await store.findRecord('persoon', personId);
  if (!person) {
    return nietBekrachtigdTriple;
  }

  return `
    ${nietBekrachtigdTriple}
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${person.uri}>.
    `;
};

export const buildNewIVMandatarisSourceTtl = async (
  store,
  instanceUri,
  personId
) => {
  const draftTriple = `<${instanceUri}> <http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus> <${MANDATARIS_DRAFT_PUBLICATION_STATE}>.`;
  if (!personId) {
    return draftTriple;
  }
  const person = await store.findRecord('persoon', personId);
  if (!person) {
    return draftTriple;
  }

  return `
    ${draftTriple}
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${person.uri}>.
    `;
};
