import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { A } from '@ember/array';

import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

export default class InstallatievergaderingService extends Service {
  @service store;
  @service currentSession;
  @service mandataris;

  @tracked
  recomputeBCSDNeededTime = null;

  @tracked iv;
  @tracked statusOptions;
  @tracked bestuursorganenInTijdMap;

  async setup(period) {
    this.selectedIv = await this.getIvForPeriod(period);
    this.statusOptions = await this.store.findAll(
      'installatievergadering-status'
    );
    this.bestuursorganenInTijdMap = new Map();
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

  async createBestuursorganenInTijdMap(bois) {
    this.bestuursorganenInTijdMap = new Map();
    for (const boi of bois) {
      this.bestuursorganenInTijdMap.set(boi.id, {
        id: boi.id,
        model: boi,
        mandatarissen:
          (await this.mandataris.getBestuursorgaanMandatarissen(boi)) ?? [],
      });
    }
  }

  get bestuursorganenInTijdMapping() {
    return Array.from(
      this.bestuursorganenInTijdMap ?? [],
      // eslint-disable-next-line no-unused-vars
      ([key, value]) => value
    );
  }

  get bestuursorganenInTijd() {
    return Array.from(
      this.bestuursorganenInTijdMap ?? [],
      // eslint-disable-next-line no-unused-vars
      ([key, value]) => value.model
    );
  }

  get isBehandeld() {
    if (!this.iv) {
      return false;
    }

    return (
      this.iv.get('status.uri') === INSTALLATIEVERGADERING_BEHANDELD_STATUS
    );
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

  addMandatarissen(boi, mandatarissen) {
    const boiData = this.bestuursorganenInTijdMap?.get(boi?.id);
    const currentMandatarissen = boiData.mandatarissen;
    delete boiData.mandatarissen;
    this.bestuursorganenInTijdMap.set(boi.id, {
      ...boiData,
      mandatarissen: [...currentMandatarissen, ...mandatarissen],
    });
  }

  getMandatarissenForBoi(boi) {
    if (!boi || !this.bestuursorganenInTijdMap) {
      return [];
    }
    return this.bestuursorganenInTijdMap?.get(boi?.id)?.mandatarissen;
  }

  async fetchMandatarissenForBoi(boi) {
    const boiData = this.bestuursorganenInTijdMap?.get(boi?.id);
    const latestMandatarissen =
      await this.mandataris.getBestuursorgaanMandatarissen(boi);

    delete boiData.mandatarissen;
    this.bestuursorganenInTijdMap.set(boi?.id, {
      ...boiData,
      mandatarissen: latestMandatarissen.toArray(),
    });
  }
}
