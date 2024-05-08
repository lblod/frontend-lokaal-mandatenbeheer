import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';
import RSVP from 'rsvp';

export default class FractiesRoute extends Route {
  @service store;
  @service tijdsspecialisaties;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    let selectedPeriod;
    if (params.bestuursperiode) {
      selectedPeriod = bestuursPeriods.find((period) => {
        return period.id == params.bestuursperiode;
      });
    } else {
      // TODO: temporary, should be the closest one if no query params.
      selectedPeriod = bestuursPeriods.at(-1);
    }

    const bestuursorganen = await this.store.query('bestuursorgaan', {
      filter: {
        ':has-no:heeft-tijdsspecialisaties': true,
        'heeft-bestuursperiode': {
          id: selectedPeriod.id,
        },
      },
    });

    const bestuursorganenIds = await Promise.all(
      bestuursorganen.map(async (o) => {
        return (await o).get('id');
      })
    );

    const fracties = await this.store.query('fractie', {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[bestuursorganen-in-tijd][id]': bestuursorganenIds.join(','),
      include: 'bestuursorganen-in-tijd',
    });

    const form = await getFormFrom(this.store, FRACTIE_FORM_ID);
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    return RSVP.hash({
      form,
      defaultFractieType,
      fracties,
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursPeriods,
      selectedPeriod,
      bestuursorganen,
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
