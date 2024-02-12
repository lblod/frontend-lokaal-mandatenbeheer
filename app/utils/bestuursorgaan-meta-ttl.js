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
