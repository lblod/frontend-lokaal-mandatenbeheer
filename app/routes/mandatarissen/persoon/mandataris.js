import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import {
  MANDATARIS_EDIT_FORM_ID,
  MANDATARIS_EXTRA_INFO_FORM_ID,
  POLITIERAAD_CODE_ID,
} from 'frontend-lmb/utils/well-known-ids';
import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

import RSVP from 'rsvp';

export default class MandatarissenPersoonMandatarisRoute extends Route {
  @service currentSession;
  @service store;
  @service router;
  @service features;
  @service semanticFormRepository;
  @service('mandatarissen') mandatarissenService;

  beforeModel(transition) {
    if (this.features.isEnabled('edit-mandataris-rework')) {
      this.router.transitionTo(
        'mandatarissen.persoon.mandataris-rework',
        transition.to.params.mandataris_id
      );
    }
  }

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
    const selectedBestuursperiode =
      await bestuursorganen[0]?.heeftBestuursperiode;
    const periodeHasLegislatuur =
      (await selectedBestuursperiode.installatievergaderingen)?.length >= 1;
    const behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIEVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': selectedBestuursperiode.id,
      }
    );

    const isDistrict = this.currentSession.isDistrict;
    const linkedMandataris = await this.linkedMandataris(params.mandataris_id);
    const showOCMWLinkedMandatarisWarning =
      this.showOCMWLinkedMandatarisWarning(
        bestuurseenheid,
        linkedMandataris.hasDouble
      );
    const possiblePolitieRaad =
      await bestuursorganen[0].isTijdsspecialisatieVan;
    const possiblePolitieRaadClassificatie =
      await possiblePolitieRaad.classificatie;
    let owners = null;
    if (possiblePolitieRaadClassificatie.id === POLITIERAAD_CODE_ID) {
      const allOwners = await this.mandatarissenService.fetchOwnership([
        mandataris.id,
      ]);
      owners = await this.store.query('bestuurseenheid', {
        filter: {
          id: allOwners[mandataris.id].join(','),
        },
      });
    }
    const history = await this.fetchHistory(
      mandataris,
      mandatarissen,
      mandatarisEditForm.id
    );

    const isMostRecentVersion =
      mandatarissen.sortBy('start').reverse()[0].id === mandataris.id;

    return RSVP.hash({
      bestuurseenheid,
      mandataris,
      mandatarissen,
      mandatarisEditForm,
      mandatarisExtraInfoForm,
      history,
      isMostRecentVersion,
      bestuursorganen,
      periodeHasLegislatuur,
      behandeldeVergaderingen,
      linkedMandataris,
      owners,
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

    return {
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

  async fetchHistory(mandataris, allMandatarissen, formId) {
    const newHistory = await Promise.all(
      allMandatarissen.map(async (m) => {
        let corrections = await this.fetchHistoryForMandataris(
          mandataris,
          formId
        );
        const historyEntry = {
          mandataris,
          corrections,
          selected: mandataris?.id === m.id,
        };
        return historyEntry;
      })
    );

    const userIdsInHistory = new Set();
    newHistory.forEach((h) => {
      h.corrections.forEach((c) => {
        userIdsInHistory.add(c.creator);
      });
    });

    let users = [];
    if (userIdsInHistory.size !== 0) {
      users = await this.store.query('gebruiker', {
        filter: {
          id: Array.from(userIdsInHistory).join(','),
        },
      });
    }

    const userIdToUser = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return newHistory
      .map((h) => {
        return {
          ...h,
          corrections: h.corrections.map((c) => ({
            ...c,
            creator: userIdToUser[c.creator],
          })),
        };
      })
      .sort((a, b) => {
        if (!b?.mandataris?.start) {
          return -1;
        }
        if (!a?.mandataris?.start) {
          return 1;
        }
        return b.mandataris.start.getTime() - a.mandataris.start.getTime();
      });
  }

  async fetchHistoryForMandataris(mandataris, formId) {
    const result = await fetch(
      `/form-content/${formId}/instances/${mandataris.id}/history`
    );

    const json = await result.json();
    return json.instances;
  }
}
