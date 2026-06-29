import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';

import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
} from 'frontend-lmb/utils/constants';
import {
  FAKE_ALLE_BESTUURSPERIODE_ID,
  OVERIGE_BESTUURSPERIODE_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class MandatarissenSearchRoute extends Route {
  @service currentSession;
  @service store;
  @service bestuursperioden;
  @service fractieApi;
  @service features;
  @service decretaleOrganen;

  queryParams = {
    filter: { refreshModel: false },
    sort: { refreshModel: false },
    bestuursperiode: { refreshModel: true },
    bestuursfunctie: { refreshModel: false },
    binnenFractie: { refreshModel: false },
    onafhankelijkeFractie: { refreshModel: false },
    fractieNietBeschikbaar: { refreshModel: false },
    activeMandatarissen: { refreshModel: false },
  };

  async model(params) {
    const periods = [];
    const allBestuursperiodes = await this.store.query('bestuursperiode', {
      sort: 'label',
      include: [
        'installatievergaderingen',
        'installatievergaderingen.status',
      ].join(','),
    });
    periods.push(...allBestuursperiodes);
    periods.push({
      id: FAKE_ALLE_BESTUURSPERIODE_ID,
      label: 'Alle',
    });

    const selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      periods,
      params.bestuursperiode
    );

    const allBestuursfunctieCodes = [];
    const mandatenVoorPeriode = await this.getMandatenForPeriod(
      selectedPeriod.id
    );
    for (const mandaat of mandatenVoorPeriode) {
      allBestuursfunctieCodes.push(await mandaat.bestuursfunctie);
    }

    const samenWerkendFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(selectedPeriod.id);

    return {
      allBestuursperiodes: periods,
      bestuursfuncties: [...new Set(allBestuursfunctieCodes)],
      selectedBestuursfunctieIds: params.bestuursfunctie,
      fracties: [
        ...samenWerkendFracties,
        placeholderOnafhankelijk,
        placeholderNietBeschikbaar,
      ],
      selectedFracties: params.binnenFractie,
    };
  }

  async getMandatenForPeriod(bestuursperiodeId) {
    const queryParams = {
      'filter[bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      'filter[bevat-in][is-tijdsspecialisatie-van][bestuurseenheid][id]':
        this.currentSession.group.id,
      page: { size: 200 },
      include: [
        'bevat-in',
        'bevat-in.heeft-bestuursperiode',
        'bestuursfunctie',
      ].join(','),
    };
    if (bestuursperiodeId !== FAKE_ALLE_BESTUURSPERIODE_ID) {
      queryParams['filter[bevat-in][heeft-bestuursperiode][:id:]'] =
        bestuursperiodeId;
    }

    return await this.store.query('mandaat', queryParams);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    if (!controller.hasInitialized) {
      controller.hasInitialized = true;
      if (!controller.bestuursperiode) {
        const relevantPeriod = this.bestuursperioden.getClosestPeriod(
          model.allBestuursperiodes
        );
        if (relevantPeriod) {
          controller.bestuursperiode = relevantPeriod.id;
        }
      }
    }
  }

  resetController(controller, isExiting) {
    super.resetController(controller, isExiting);
    if (isExiting) {
      controller.hasInitialized = false;
      controller.bestuursperiode = null;
    }
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
