export const getBestuursorgaanMetaTtl = (bestuursorgaan) => {
  if (!bestuursorgaan) {
    return;
  }
  const bestuursorgaanUri = bestuursorgaan.uri;

  return `
    @prefix mandaat: <http://data.vlaanderen.be/ns/mandaat#> .
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

    ext:applicationContext ext:currentBestuursorgaan <${bestuursorgaanUri}> .
  `;
};
