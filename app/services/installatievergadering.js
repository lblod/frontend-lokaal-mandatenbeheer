import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';
import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class InstallatievergaderingService extends Service {
  @service store;
  @service currentSession;

  @tracked
  recomputeBCSDNeededTime = null;

  @tracked allMandatarissen = [];
  @tracked iv;
  @tracked statusOptions;

  async setup(period) {
    this.selectedIv = await this.getIvForPeriod(period);
    this.statusOptions = await this.store.findAll(
      'installatievergadering-status'
    );
  }

  async getIvForPeriod(period) {
    if (!period) {
      return null;
    }

    const ivs = await this.store.query('installatievergadering', {
      'filter[bestuurseenheid][id]': this.currentSession.group.id,
      'filter[bestuursperiode][:id:]': period.id,
      include: ['status'].join(','),
    });
    if (ivs.length >= 1) {
      this.iv = ivs.at(0);
    } else {
      this.iv = null;
    }
  }

  get isBehandeld() {
    if (!this.iv) {
      return false;
    }

    return (
      this.iv.get('status.uri') === INSTALLATIEVERGADERING_BEHANDELD_STATUS
    );
  }

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
