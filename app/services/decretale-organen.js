import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { DECRETALE_BESTUURSORGANEN_CONCEPT_SCHEME } from 'frontend-lmb/utils/well-known-ids';
import { tracked } from '@glimmer/tracking';

export default class DecretaleOrganenService extends Service {
  @service store;
  @tracked decretaleCodes;

  async setup() {
    const conceptScheme = await this.store.findRecord(
      'concept-scheme',
      DECRETALE_BESTUURSORGANEN_CONCEPT_SCHEME,
      { include: 'concepts' }
    );

    this.decretaleCodes = await conceptScheme.concepts;
  }

  get codeUris() {
    return this.decretaleCodes.map((code) => code.uri);
  }
}
