import { MANDATARIS_EFFECTIEF_PUBLICATION_STATE } from './well-known-uris';

export const buildNewMandatarisSourceTtl = async (
  store,
  instanceUri,
  personId
) => {
  const effectiefTriple = `
    <${instanceUri}> <http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus> <${MANDATARIS_EFFECTIEF_PUBLICATION_STATE}>.
    <${instanceUri}> <http://lblod.data.gift/vocabularies/lmb/effectiefAt> "${new Date().toJSON()}"^^<http://www.w3.org/2001/XMLSchema#DateTime>.
  `;
  if (!personId) {
    return effectiefTriple;
  }
  const person = await store.findRecord('persoon', personId);
  if (!person) {
    return effectiefTriple;
  }

  return `
    ${effectiefTriple}
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${person.uri}>.
    `;
};
