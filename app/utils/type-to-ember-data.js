export const typeToEmberData = {
  'http://data.vlaanderen.be/ns/mandaat#Mandataris': {
    route: 'mandatarissen.mandataris',
    model: 'mandataris',
    classLabel: 'Mandatarissen',
    include: 'is-bestuurlijke-alias-van,bekleedt.bestuursfunctie',
  },
  'http://www.w3.org/ns/person#Person': {
    route: 'mandatarissen.persoon.mandaten',
    model: 'persoon',
    classLabel: 'Personen',
    include: 'geboorte',
  },
  'http://data.vlaanderen.be/ns/besluit#Bestuursorgaan': {
    route: 'organen.orgaan.mandatarissen',
    model: 'bestuursorgaan',
    classLabel: 'Bestuursorganen',
    include: 'is-tijdsspecialisatie-van.classificatie,classificatie',
  },
  'http://data.vlaanderen.be/ns/mandaat#Fractie': {
    route: 'organen.fracties',
    model: 'fractie',
    classLabel: 'Fracties',
    include: 'bestuursorganen-in-tijd',
  },
};
