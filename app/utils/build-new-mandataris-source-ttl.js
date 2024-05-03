import { MANDATARIS_DRAFT_STATE } from './well-known-uris';

export const buildNewMandatarisSourceTtl = async (
  store,
  instanceUri,
  person
) => {
  const draftTriple = `<${instanceUri}> <http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus> <${MANDATARIS_DRAFT_STATE}>.`;
  if (!person) {
    return draftTriple;
  }
  const persoon = await store.findRecord('persoon', person);
  if (!persoon) {
    return draftTriple;
  }

  return `
    ${draftTriple}
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${persoon.uri}>.
    `;
};
