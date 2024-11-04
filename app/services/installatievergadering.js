import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { service } from '@ember/service';
import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';
import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class InstallatievergaderingService extends Service {
  @service store;

  @tracked
  recomputeBCSDNeededTime = null;

  @tracked
  allMandatarissen = [];

  get sortedMandatarissen() {
    return orderMandatarissenByRangorde([...this.allMandatarissen]);
  }

  forceRecomputeBCSD() {
    this.recomputeBCSDNeededTime = new Date();
  }

  async activeOrNoLegislature(bestuursperiode) {
    const periodeHasLegislatuur =
      (await bestuursperiode.installatievergaderingen).length >= 1;
    const behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIEVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': bestuursperiode.id,
      }
    );
    return periodeHasLegislatuur && behandeldeVergaderingen.length === 0;
  }

  removeMandatarissen(mandatarissen) {
    this.allMandatarissen.removeObjects(mandatarissen);
  }

  addMandatarissen(mandatarissen) {
    this.allMandatarissen.pushObjects(mandatarissen);
  }
}
