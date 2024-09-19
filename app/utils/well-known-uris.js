export const FRACTIETYPE_ONAFHANKELIJK =
  'http://data.vlaanderen.be/id/concept/Fractietype/Onafhankelijk';
export const FRACTIETYPE_SAMENWERKINGSVERBAND =
  'http://data.vlaanderen.be/id/concept/Fractietype/Samenwerkingsverband';
export const BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001';
export const BESTUURSEENHEID_CLASSIFICATIECODE_OCMW =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002';
export const MANDATARIS_VERHINDERD_STATE =
  'http://data.vlaanderen.be/id/concept/MandatarisStatusCode/c301248f-0199-45ca-b3e5-4c596731d5fe';
export const MANDATARIS_TITELVOEREND_STATE =
  'http://data.vlaanderen.be/id/concept/MandatarisStatusCode/aacb3fed-b51d-4e0b-a411-f3fa641da1b3';
export const MANDATARIS_EFFECTIEF_STATE =
  'http://data.vlaanderen.be/id/concept/MandatarisStatusCode/21063a5b-912c-4241-841c-cc7fb3c73e75';
// This is a fake status that we use in the update state logic of a mandataris to easily (and clearly for the user end the mandate)
export const MANDATARIS_BEEINDIGD_STATE =
  'http://data.vlaanderen.be/id/concept/MandatarisStatusCode/b8866fa2-d61c-4e3d-afaf-8a29eaaa7fb9';
export const MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE =
  'http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/9d8fd14d-95d0-4f5e-b3a5-a56a126227b6';
export const MANDATARIS_DRAFT_PUBLICATION_STATE =
  'http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/588ce330-4abb-4448-9776-a17d9305df07';
export const MANDATARIS_EFFECTIEF_PUBLICATION_STATE =
  'http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/d3b12468-3720-4cb0-95b4-6aa2996ab188';
export const BELEIDSDOMEIN_CODES_CONCEPT_SCHEME =
  'http://data.vlaanderen.be/id/conceptscheme/BeleidsdomeinCode';

export const GEMEENTERAAD_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000005';
export const RMW_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000007';
export const BURGEMEESTER_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/4955bd72cd0e4eb895fdbfab08da0284';
export const CBS_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000006';
export const VAST_BUREAU_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000008';
export const BCSD_BESTUURSORGAAN_URI =
  'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000009';

export const MANDAAT_GEMEENTERAADSLID_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000011';
export const MANDAAT_LID_RMW_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000015';
export const MANDAAT_VOORZITTER_GEMEENTERAAD_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000012';
export const MANDAAT_VOORZITTER_RMW_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000016';
export const MANDAAT_LID_VAST_BUREAU_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000017';
export const MANDAAT_VOORZITTER_VAST_BUREAU_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000018';
export const MANDAAT_VOORZITTER_BCSD_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e00001a';
export const MANDAAT_BURGEMEESTER_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000013';
export const MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/7b038cc40bba10bec833ecfe6f15bc7a';
export const MANDAAT_DISTRICT_BURGEMEESTER_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e00001d';
export const MANDAAT_SCHEPEN_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000014';
export const MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/59a90e03-4f22-4bb9-8c91-132618db4b38';
export const MANDAAT_DISTRICT_SCHEPEN_CODE =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e00001e';

export const burgemeesterOnlyStates = [MANDATARIS_TITELVOEREND_STATE];
export const notBurgemeesterStates = [MANDATARIS_VERHINDERD_STATE];

export const INSTALLATIEVERGADERING_BEHANDELD_STATUS =
  'http://data.lblod.info/id/concept/InstallatievergaderingStatus/c9fc3292-1576-4a82-8dcd-60795e22131f';
export const INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS =
  'http://data.lblod.info/id/concept/InstallatievergaderingStatus/b54dbe98-d618-4af7-9f01-791aa90774e4';
export const INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS =
  'http://data.lblod.info/id/concept/InstallatievergaderingStatus/a40b8f8a-8de2-4710-8d9b-3fc43a4b740e';
