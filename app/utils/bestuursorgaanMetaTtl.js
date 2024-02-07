export const getBestuursorgaanMetaTtl = (bestuursorgaan) => {
  if (!bestuursorgaan) {
    return;
  }
  const bestuursorgaanUri = bestuursorgaan.uri;
  const bindingStart = bestuursorgaan.bindingStart;
  const bindingEinde = bestuursorgaan.bindingEinde;

  let endDateTriple = '';
  if (bindingEinde) {
    endDateTriple = `mandaat:bindingEinde "${bindingEinde}"^^xsd:date`;
  }

  return `
    @prefix mandaat: <http://data.vlaanderen.be/ns/mandaat#> .
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

    ext:applicationContext ext:currentBestuursorgaan <${bestuursorgaanUri}> .

    <${bestuursorgaanUri}> mandaat:bindingStart "${bindingStart}"^^xsd:date ${endDateTriple}.
  `;
};
