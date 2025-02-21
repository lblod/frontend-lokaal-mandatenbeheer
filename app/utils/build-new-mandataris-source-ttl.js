import { MANDATARIS_EFFECTIEF_PUBLICATION_STATE } from './well-known-uris';

export const buildNewMandatarisSourceTtl = async (
  store,
  instanceUri,
  personId
) => {
  const draftTriple = `<${instanceUri}> <http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus> <${MANDATARIS_EFFECTIEF_PUBLICATION_STATE}>.`;
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
