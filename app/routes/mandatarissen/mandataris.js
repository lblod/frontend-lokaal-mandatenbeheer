import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getUniqueVervangers } from 'frontend-lmb/models/mandataris';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_EDIT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class MandatarissenMandatarisRoute extends Route {
  @service store;

  async model(params) {
    const mandataris = await this.getMandataris(params.id);
    const persoon = await mandataris.isBestuurlijkeAliasVan;
    const mandaat = await mandataris.bekleedt;
    const vervangers = await getUniqueVervangers(mandataris);
    const mandatarissen = await this.getMandatarissen(persoon, mandaat);
    const publicationStatuses = await this.store.findAll(
      'mandataris-publication-status'
    );

    const mandatarisEditForm = getFormFrom(this.store, MANDATARIS_EDIT_FORM_ID);

    const bestuursorganen = await (await mandataris.bekleedt).get('bevatIn');

    return RSVP.hash({
      mandataris,
      vervangers,
      mandatarissen,
      publicationStatuses,
      mandatarisEditForm,
      bestuursorganen,
    });
  }

  async getMandataris(id) {
    let queryParams = {
      include: [
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in',
        'beleidsdomein',
        'status',
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
}
