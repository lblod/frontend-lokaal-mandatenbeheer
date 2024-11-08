import Service from '@ember/service';

import { service } from '@ember/service';

export default class VerkiezingService extends Service {
  @service store;

  async checkIfPersonIsElected(personId, bestuursorgaan) {
    const matches = await this.store.query('persoon', {
      include: [
        'verkiezingsresultaten',
        'verkiezingsresultaten.kandidatenlijst',
        'verkiezingsresultaten.kandidatenlijst.verkiezing',
        'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorganen-in-tijd',
        'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorganen-in-tijd.heeft-bestuursperiode',
      ].join(','),
      'filter[verkiezingsresultaten][kandidatenlijst][verkiezing][bestuursorganen-in-tijd][:id:]':
        bestuursorgaan.id,
      'filter[verkiezingsresultaten][persoon][:id:]': personId,
    });
    return matches.length > 0;
  }
}
