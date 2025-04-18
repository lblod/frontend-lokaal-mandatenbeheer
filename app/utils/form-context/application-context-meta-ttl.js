import { EXT, LMB } from 'frontend-lmb/rdf/namespaces';
import { NULL_DATE } from 'frontend-lmb/utils/constants';
import { isRequiredForBestuursorgaan } from '../is-fractie-selector-required';

// Expects bestuursorgaan in de tijd
export const getApplicationContextMetaTtl = async (bestuursorganen) => {
  if (!bestuursorganen) {
    return;
  }
  let bestuursorgaanUris;
  bestuursorgaanUris = bestuursorganen
    .map((orgaan) => {
      return `<${orgaan.uri}>`;
    })
    .join(', ');

  const period = getBestuursperiodeForBestuursorganen(bestuursorganen);
  const isFractieRequired = await isRequiredForBestuursorgaan(
    bestuursorganen.at(0)
  );

  return `
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .
    @prefix lmb: <http://lblod.data.gift/vocabularies/lmb/> .

    ext:applicationContext ext:currentBestuursorgaan ${bestuursorgaanUris} .

    <http://lblod.data.gift/vocabularies/lmb/component> <http://lblod.data.gift/vocabularies/lmb/isFractieRequired> ${isFractieRequired}.

    ${
      period
        ? `
        ext:applicationContext lmb:periodStart """${period.startDate}""";
                               lmb:periodEnd """${period.endDate}""".
        `
        : ''
    }
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

export const loadBestuursorgaanPeriodFromContext = (storeOptions) => {
  const startDate = storeOptions.store.any(
    EXT('applicationContext'),
    LMB('periodStart'),
    null,
    storeOptions.metaGraph
  );
  const endDate = storeOptions.store.any(
    EXT('applicationContext'),
    LMB('periodEnd'),
    null,
    storeOptions.metaGraph
  );

  return {
    startDate: new Date(startDate.value),
    endDate: new Date(endDate.value),
  };
};

const getBestuursperiodeForBestuursorganen = (bestuursorganen) => {
  if (bestuursorganen.length >= 1) {
    const bestuursorgaan = bestuursorganen.at(0);

    return {
      startDate: bestuursorgaan.bindingStart ?? NULL_DATE,
      endDate: bestuursorgaan.bindingEinde ?? NULL_DATE,
    };
  }

  throw new Error('Could not get bestuursorgaan to build up meta ttl');
};

export const loadIsFractieRequiredFromContext = (storeOptions) => {
  const { store, metaGraph } = storeOptions;

  const isRequired = store.any(
    LMB('component'),
    LMB('isFractieRequired'),
    null,
    metaGraph
  );
  return isRequired.value === '1' || isRequired.value === 'true';
};
