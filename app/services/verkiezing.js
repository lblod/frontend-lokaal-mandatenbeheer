import Service from '@ember/service';

import { service } from '@ember/service';

export default class VerkiezingService extends Service {
  @service store;

  async checkIfPersonIsElected(personId, bestuursperiode) {
    if (!personId || !bestuursperiode) {
      return [];
    }

    const matches = await this.store.query('persoon', {
      include: [
        'verkiezingsresultaten',
        'verkiezingsresultaten.kandidatenlijst',
        'verkiezingsresultaten.kandidatenlijst.verkiezing',
        'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorgaan-in-tijd',
        'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorgaan-in-tijd.heeft-bestuursperiode',
      ].join(','),
      'filter[verkiezingsresultaten][kandidatenlijst][verkiezing][bestuursorgaan-in-tijd][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      'filter[verkiezingsresultaten][persoon][:id:]': personId,
    });
    return matches.length > 0;
  }
}
