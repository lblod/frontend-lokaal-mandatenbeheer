import { EXT } from 'frontend-lmb/rdf/namespaces';

export const getBestuursorgaanMetaTtl = (bestuursorgaan) => {
  if (!bestuursorgaan) {
    return;
  }
  const bestuursorgaanUri = bestuursorgaan.uri;

  return `
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .

    ext:applicationContext ext:currentBestuursorgaan <${bestuursorgaanUri}> .
  `;
};

export const loadBestuursorgaanUriFromContext = (storeOptions) => {
  const forkingStore = storeOptions.store;
  const bestuursorgaanUri = forkingStore.any(
    EXT('applicationContext'),
    EXT('currentBestuursorgaan'),
    null,
    storeOptions.metaGraph
  );

  return bestuursorgaanUri?.value;
};
