import { EXT } from 'frontend-lmb/rdf/namespaces';

// Expects bestuursorgaan in de tijd
export const getBestuursorganenMetaTtl = (bestuursorgaan) => {
  if (!bestuursorgaan) {
    return;
  }
  let bestuursorgaanUris;
  bestuursorgaanUris = bestuursorgaan
    .map((orgaan) => {
      return `<${orgaan.uri}>`;
    })
    .join(', ');

  return `
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .

    ext:applicationContext ext:currentBestuursorgaan ${bestuursorgaanUris} .
  `;
};

export const loadBestuursorgaanUrisFromContext = (storeOptions) => {
  const forkingStore = storeOptions.store;
  const bestuursorgaanUri = forkingStore.match(
    EXT('applicationContext'),
    EXT('currentBestuursorgaan'),
    null,
    storeOptions.metaGraph
  );

  return bestuursorgaanUri?.map((node) => node.object.value);
};
