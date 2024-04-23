import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class FractiesRoute extends Route {
  @service store;
  @service tijdsspecialisaties;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    startDate: { refreshModel: true },
    endDate: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const organenWithPeriods =
      await this.tijdsspecialisaties.fetchBestuursOrganenWithTijdsperiods(
        parentModel.bestuursorganen,
        params
      );

    const bestuursorganenIds = await Promise.all(
      organenWithPeriods.bestuursorganen.map(async (o) => {
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

    return {
      form,
      defaultFractieType,
      fracties,
      bestuurseenheid: parentModel.bestuurseenheid,
      ...organenWithPeriods,
    };
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
