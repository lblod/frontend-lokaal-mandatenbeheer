import { EXT } from 'frontend-lmb/rdf/namespaces';

export const getBestuursorgaanMetaTtl = (bestuursorgaan) => {
  if (!bestuursorgaan) {
    return;
  }
  let bestuursorgaanUris;
  if (bestuursorgaan.length) {
    bestuursorgaanUris = bestuursorgaan
      .map((orgaan) => {
        return `<${orgaan.uri}>`;
      })
      .join(', ');
  } else {
    bestuursorgaanUris = `<${bestuursorgaan.uri}>`;
  }

  return `
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .

    ext:applicationContext ext:currentBestuursorgaan ${bestuursorgaanUris} .
  `;
};

export const loadBestuursorgaanUriFromContext = (storeOptions) => {
  const forkingStore = storeOptions.store;
  const bestuursorgaanUri = forkingStore.match(
    EXT('applicationContext'),
    EXT('currentBestuursorgaan'),
    null,
    storeOptions.metaGraph
  );

  return bestuursorgaanUri?.map((node) => node.object.value);
};
