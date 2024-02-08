import { ORG, RDF, MANDAAT } from 'frontend-lmb/rdf/namespaces';

const fetchMembershipFromEmberStore = async function (store, mandatarisUri) {
  const matches = await store.query('mandataris', {
    'filter[:uri:]': mandatarisUri.value,
    include: 'heeft-lidmaatschap',
  });
  const mandatarisFromStore = matches.at(0);
  return mandatarisFromStore?.heeftLidmaatschap;
};

const fetchMembership = async function (store, mandataris, storeOptions) {
  const formStore = storeOptions.store;
  const membership = formStore.any(
    mandataris,
    ORG('hasMembership'),
    null,
    storeOptions.sourceGraph
  )[0];

  if (!membership) {
    return fetchMembershipFromEmberStore(store, mandataris, storeOptions);
  }

  const matches = await store.query('lidmaatschap', {
    'filter[:uri:]': membership.value,
  });
  return matches.at(0);
};

const getMandatarisDates = function (mandataris, storeOptions) {
  const formStore = storeOptions.store;
  const start = formStore.any(
    mandataris,
    MANDAAT('start'),
    null,
    storeOptions.sourceGraph
  )[0];
  const end = formStore.any(
    mandataris,
    MANDAAT('einde'),
    null,
    storeOptions.sourceGraph
  )[0];
  return { start, end };
};

export const syncMandatarisMembership = async function (
  store,
  form,
  storeOptions
) {
  const formStore = storeOptions.store;
  const mandataris = formStore.match(
    null,
    RDF('type'),
    MANDAAT('Mandataris'),
    storeOptions.sourceGraph
  )[0];
  const { start, end } = getMandatarisDates(mandataris, storeOptions);
  const membership = await fetchMembership(
    store,
    mandataris.subject,
    storeOptions
  );
  membership.start = new Date(start.value);
  membership.einde = new Date(end.value);
  await membership.save();
};
