import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { A } from '@ember/array';

import {
  INSTALLATIEVERGADERING_BEHANDELD_STATUS,
  INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS,
  INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS,
} from 'frontend-lmb/utils/well-known-uris';

export default class InstallatievergaderingService extends Service {
  @service store;
  @service currentSession;
  @service mandataris;

  @tracked
  recomputeBCSDNeededTime = null;

  @tracked iv;
  @tracked currentPeriod;
  @tracked currentStatus;
  @tracked statusOptions;
  @tracked bestuursorganenInTijdMap;
  @tracked bestuursorganenInTijd;
  @tracked isStatus = {
    teBehandelen: false,
    klaarVoorVergadering: false,
    behandeld: false,
  };

  async setup(period, bestuursorganenInTijd = null) {
    await this.setIvForPeriod(period);
    if (bestuursorganenInTijd) {
      this.bestuursorganenInTijdMap = new Map();
      await this.createBestuursorganenInTijdMap(bestuursorganenInTijd);
    }
    await this.setStatus(await this.iv?.status);
    this.statusOptions = await this.store.findAll(
      'installatievergadering-status'
    );
  }

  async setIvForPeriod(period) {
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
      this.currentPeriod = period;
    } else {
      this.iv = null;
    }
  }

  async createBestuursorganenInTijdMap(bestuursorganenInTijd) {
    this.bestuursorganenInTijdMap = new Map();
    for (const boi of bestuursorganenInTijd) {
      this.bestuursorganenInTijdMap.set(boi.id, {
        id: boi.id,
        model: boi,
        mandatarissen:
          (await this.mandataris.getBestuursorgaanMandatarissen(boi)) ?? [],
      });
    }
    this.bestuursorganenInTijd = Array.from(
      this.bestuursorganenInTijdMap ?? [],
      // eslint-disable-next-line no-unused-vars
      ([key, value]) => value.model
    );
  }

  setIsStatusStates() {
    const isCurrent = (statusUri) => this.currentStatus.uri === statusUri;

    this.isStatus = {
      teBehandelen: isCurrent(INSTALLATIEVERGADERING_TE_BEHANDELEN_STATUS),
      klaarVoorVergadering: isCurrent(
        INSTALLATIEVERGADERING_KLAAR_VOOR_VERGADERING_STATUS
      ),
      behandeld: isCurrent(INSTALLATIEVERGADERING_BEHANDELD_STATUS),
    };
  }

  async setStatus(status) {
    if (!status || !this.iv) {
      return;
    }

    this.iv.status = status;
    await this.iv.save();
    this.currentStatus = status;
    this.setIsStatusStates();
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

  addMandatarissen(bestuursorgaanInTijd, mandatarissen) {
    const boiData = this.bestuursorganenInTijdMap?.get(
      bestuursorgaanInTijd?.id
    );
    const currentMandatarissen = boiData.mandatarissen;
    delete boiData.mandatarissen;
    this.bestuursorganenInTijdMap.set(bestuursorgaanInTijd.id, {
      ...boiData,
      mandatarissen: [...currentMandatarissen, ...mandatarissen],
    });
  }

  removeMandatarissen(bestuursorgaanInTijd, mandatarissen) {
    const boiData = this.bestuursorganenInTijdMap?.get(
      bestuursorgaanInTijd?.id
    );
    const currentMandatarissen = boiData.mandatarissen;
    const editArray = A(currentMandatarissen);
    editArray.removeObjects(mandatarissen);
    this.bestuursorganenInTijdMap.set(bestuursorgaanInTijd.id, {
      ...boiData,
      mandatarissen: editArray.toArray(),
    });
  }

  getMandatarissenForBoi(bestuursorgaanInTijd) {
    if (!bestuursorgaanInTijd || !this.bestuursorganenInTijdMap) {
      return [];
    }
    return this.bestuursorganenInTijdMap?.get(bestuursorgaanInTijd?.id)
      ?.mandatarissen;
  }

  async fetchMandatarissenForBoi(bestuursorgaanInTijd) {
    const boiData = this.bestuursorganenInTijdMap?.get(
      bestuursorgaanInTijd?.id
    );
    const latestMandatarissen =
      await this.mandataris.getBestuursorgaanMandatarissen(
        bestuursorgaanInTijd
      );

    delete boiData.mandatarissen;
    this.bestuursorganenInTijdMap.set(bestuursorgaanInTijd?.id, {
      ...boiData,
      mandatarissen: latestMandatarissen.toArray(),
    });
  }
}
