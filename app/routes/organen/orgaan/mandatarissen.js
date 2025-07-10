import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class OrganenMandatarissenRoute extends Route {
  @service currentSession;
  @service store;
  @service validatie;
  @service features;
  @service installatievergadering;
  @service bestuursperioden;
  @service semanticFormRepository;
  @service('mandatarissen') mandatarissenService;

  queryParams = {
    activeOnly: { refreshModel: true },
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursorgaan = parentModel.bestuursorgaan;
    const bestuursorgaanInTijd = await parentModel.currentBestuursorgaan;
    const hasRangorde = await bestuursorgaan.hasRangorde;
    if (!params.sort) {
      params.sort = hasRangorde
        ? 'rangorde'
        : 'is-bestuurlijke-alias-van.achternaam';
    }

    const bestuurseenheid = this.currentSession.group;

    let mandatarissen;
    if (bestuursorgaanInTijd) {
      mandatarissen = await this.mandatarissenService.getMandatarissen(
        params,
        bestuursorgaanInTijd
      );
    }
    let validatie = null;
    if (this.features.isEnabled('shacl-report')) {
      validatie = this.validatie;
    }
    const folded = await foldMandatarisses(params, mandatarissen, validatie);
    const filtered = this.getFilteredMandatarissen(
      folded,
      params,
      parentModel.selectedBestuursperiode
    );
    await this.addOwnership(bestuursorgaan, filtered);
    const mandatarisNewForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDATARIS_NEW_FORM_ID
      );

    const legislatuurInBehandeling =
      await this.installatievergadering.activeOrNoLegislature(
        parentModel.selectedBestuursperiode
      );
    const isDistrict = this.currentSession.isDistrict;
    return {
      bestuurseenheid,
      hasRangorde,
      mandatarissen: filtered,
      bestuursorgaan,
      bestuursorgaanInTijd,
      isEigenOrgaan: !(await bestuursorgaan.isDecretaal),
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
      legislatuurInBehandeling: isDistrict ? false : legislatuurInBehandeling,
    };
  }

  getFilteredMandatarissen(mandatarissen, params, bestuursperiode) {
    let filteredMandatarissen = mandatarissen;
    const isCurrentBestuursperiode =
      this.bestuursperioden.isCurrentPeriod(bestuursperiode);
    if (params.activeOnly && isCurrentBestuursperiode) {
      filteredMandatarissen = mandatarissen.filter(
        (mandataris) => mandataris.mandataris.isActive
      );
    }
    return filteredMandatarissen;
  }

  async addOwnership(bestuursorgaan, filteredMandatarissen) {
    if (!bestuursorgaan.isPolitieraad || filteredMandatarissen.length === 0) {
      return;
    }
    const mandatarisIds = filteredMandatarissen.map(
      (mandataris) => mandataris.mandataris.id
    );
    const ownership =
      await this.mandatarissenService.fetchOwnership(mandatarisIds);
    const bestuurseenheidIds = Object.values(ownership).flat();
    const bestuurseenheden = await this.store.query('bestuurseenheid', {
      filter: { id: bestuurseenheidIds.join(',') },
    });
    Object.keys(ownership).map((mandatarisId) => {
      const enrichedMandataris = filteredMandatarissen.find(
        (mandataris) => mandataris.mandataris.id === mandatarisId
      );
      if (enrichedMandataris) {
        enrichedMandataris.owners = bestuurseenheden.filter((eenheid) =>
          ownership[mandatarisId].includes(eenheid.id)
        );
      }
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    if (!controller.sort) {
      controller.sort = model.hasRangorde
        ? 'rangorde'
        : 'is-bestuurlijke-alias-van.achternaam';
    }
  }
}
