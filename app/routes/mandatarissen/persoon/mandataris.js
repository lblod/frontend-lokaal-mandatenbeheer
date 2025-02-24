import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';

import {
  MANDATARIS_EDIT_FORM_ID,
  MANDATARIS_EXTRA_INFO_FORM_ID,
} from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class MandatarissenPersoonMandatarisRoute extends Route {
  @service currentSession;
  @service store;
  @service semanticFormRepository;

  async model(params) {
    const bestuurseenheid = this.currentSession.group;
    const parentModel = await this.modelFor('mandatarissen.persoon');
    const persoon = parentModel.persoon;

    const mandataris = await this.getMandataris(params.mandataris_id);
    const mandaat = await mandataris.bekleedt;
    const mandatarissen = await this.getMandatarissen(persoon, mandaat);

    const mandatarisEditForm = this.semanticFormRepository.getFormDefinition(
      MANDATARIS_EDIT_FORM_ID
    );
    const mandatarisExtraInfoForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDATARIS_EXTRA_INFO_FORM_ID
      );

    const bestuursorganen = await mandaat.bevatIn;
    const selectedBestuursperiode = (await bestuursorganen)[0]
      .heeftBestuursperiode;
    const isDistrict = this.currentSession.isDistrict;
    const linkedMandataris = await this.linkedMandataris(params.mandataris_id);
    console.log(linkedMandataris);
    const showOCMWLinkedMandatarisWarning =
      this.showOCMWLinkedMandatarisWarning(
        bestuurseenheid,
        linkedMandataris.hasDouble
      );

    return RSVP.hash({
      bestuurseenheid,
      mandataris,
      mandatarissen,
      mandatarisEditForm,
      mandatarisExtraInfoForm,
      bestuursorganen,
      selectedBestuursperiode,
      linkedMandataris,
      isDistrictEenheid: isDistrict,
      effectiefIsLastPublicationStatus:
        await effectiefIsLastPublicationStatus(mandataris),
      showOCMWLinkedMandatarisWarning,
    });
  }

  async getMandataris(id) {
    let queryParams = {
      include: [
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in',
        'bekleedt.bevat-in.classificatie',
        'beleidsdomein',
        'status',
        'publication-status',
        'tijdelijke-vervangingen',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    let mandataris = await this.store.findRecord('mandataris', id, queryParams);
    return mandataris;
  }

  async getMandatarissen(persoon, mandaat) {
    let queryParams = {
      sort: '-start',
      filter: {
        'is-bestuurlijke-alias-van': {
          id: persoon.id,
        },
        bekleedt: {
          id: mandaat.id,
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'beleidsdomein',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    return await this.store.query('mandataris', queryParams);
  }

  async linkedMandataris(mandataris) {
    const response = await fetch(
      `/mandataris-api/mandatarissen/${mandataris}/check-possible-double`
    );
    const jsonResponse = await response.json();

    if (response.status !== 200) {
      throw jsonResponse.message;
    }
    const hasDouble = !!jsonResponse.hasDouble;
    delete jsonResponse.hasDouble;

    return {
      currentMandate: jsonResponse.currentMandate ?? null,
      duplicateMandate: jsonResponse.duplicateMandate ?? null,
      hasDouble,
    };
  }

  async showOCMWLinkedMandatarisWarning(bestuurseenheid, hasLinkedMandataris) {
    const isOCMW = bestuurseenheid.isOCMW;
    if (!isOCMW) {
      return false;
    }

    return hasLinkedMandataris;
  }
}
