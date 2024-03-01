import { ORG, MANDAAT } from 'frontend-lmb/rdf/namespaces';
import { NamedNode } from 'rdflib';

const fetchMembershipFromEmberStore = async function (store, mandatarisUri) {
  const matches = await store.query('mandataris', {
    'filter[:uri:]': mandatarisUri,
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
  );

  if (!membership) {
    return fetchMembershipFromEmberStore(store, mandataris, storeOptions);
  }

  const matches = await store.query('lidmaatschap', {
    'filter[:uri:]': membership.value,
  });
  return matches.at(0);
};

const getMandatarisDates = function (mandatarisUri, storeOptions) {
  const formStore = storeOptions.store;
  const begin = formStore.any(
    new NamedNode(mandatarisUri),
    MANDAAT('start'),
    null,
    storeOptions.sourceGraph
  );
  const end = formStore.any(
    new NamedNode(mandatarisUri),
    MANDAAT('einde'),
    null,
    storeOptions.sourceGraph
  );
  return { begin, end };
};

const ensureTimeFrame = async function (store, membership) {
  let timeFrame = await membership.tijdsinterval;
  if (!timeFrame) {
    timeFrame = store.createRecord('tijdsinterval');
    membership.lidGedurende = timeFrame;
  }
  return timeFrame;
};

export const syncMandatarisMembership = async function (
  mandatarisUri,
  store,
  storeOptions
) {
  const { begin: begin, end } = getMandatarisDates(mandatarisUri, storeOptions);
  const membership = await fetchMembership(store, mandatarisUri, storeOptions);
  if (!membership) {
    return;
  }
  const timeFrame = await ensureTimeFrame(store, membership);
  timeFrame.begin = begin ? new Date(begin.value) : null;
  timeFrame.einde = end ? new Date(end.value) : null;
  await timeFrame.save();
  await membership.save();
};
