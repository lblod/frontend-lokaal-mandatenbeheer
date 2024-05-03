import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';

export const syncNewMandatarisMembership = async (
  store,
  instanceTtl,
  instanceId
) => {
  const formStore = new ForkingStore();
  formStore.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
  const mandataris = await store.findRecord('mandataris', instanceId);
  await syncMandatarisMembership(mandataris.uri, store, {
    store: formStore,
    sourceGraph: SOURCE_GRAPH,
  });
};
