import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import {
  DECRETALE_BESTUURSORGANEN_CONCEPT_SCHEME,
  GEMEENTE_BESTUURSORGANEN_CONCEPT_SCHEME,
  OTHER_BESTUURSORGANEN_CONCEPT_SCHEME,
  POLITIERAAD_CODE_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class DecretaleOrganenService extends Service {
  @service store;
  @tracked decretaleCodes;
  @tracked gemeenteCodes;
  @tracked otherCodes;

  async setup() {
    const conceptScheme = await this.store.query('concept-scheme', {
      filter: {
        id: [
          DECRETALE_BESTUURSORGANEN_CONCEPT_SCHEME,
          GEMEENTE_BESTUURSORGANEN_CONCEPT_SCHEME,
          OTHER_BESTUURSORGANEN_CONCEPT_SCHEME,
        ].join(','),
      },
      include: 'concepts',
    });

    await Promise.all(
      conceptScheme.map(async (scheme) => {
        if (scheme.id === DECRETALE_BESTUURSORGANEN_CONCEPT_SCHEME) {
          this.decretaleCodes = await scheme.concepts;
        }
        if (scheme.id === GEMEENTE_BESTUURSORGANEN_CONCEPT_SCHEME) {
          this.gemeenteCodes = await scheme.concepts;
        }
        if (scheme.id === OTHER_BESTUURSORGANEN_CONCEPT_SCHEME) {
          this.otherCodes = await scheme.concepts;
        }
      })
    );
  }

  get decretaleCodeUris() {
    return [
      ...this.decretaleCodes.map((code) => code.uri),
      ...this.gemeenteCodes.map((code) => code.uri),
    ];
  }

  get gemeenteCodeUris() {
    return this.gemeenteCodes.map((code) => code.uri);
  }

  get classificatieUris() {
    return [
      ...this.decretaleCodes.map((code) => code.uri),
      ...this.gemeenteCodes.map((code) => code.uri),
      ...this.otherCodes.map((code) => code.uri),
    ];
  }

  get classificatieIds() {
    return [
      ...this.decretaleCodes.map((code) => code.id),
      ...this.gemeenteCodes.map((code) => code.id),
      ...this.otherCodes.map((code) => code.id),
    ];
  }

  get decretaleIds() {
    return [
      ...this.decretaleCodes.map((code) => code.id),
      ...this.gemeenteCodes.map((code) => code.id),
      POLITIERAAD_CODE_ID,
    ];
  }

  get nietDecretaleIds() {
    return this.otherCodes.map((code) => code.id);
  }
}
