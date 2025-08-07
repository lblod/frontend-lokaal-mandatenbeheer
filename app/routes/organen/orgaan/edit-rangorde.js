import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';

export default class EditRangordeRoute extends Route {
  @service store;
  @service('mandatarissen') mandatarissenService;

  queryParams = {
    date: {
      refreshModel: true,
    },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursorgaanInTijd = await parentModel.currentBestuursorgaan;

    let mandatarissen;

    if (bestuursorgaanInTijd) {
      params.size = 9999;
      mandatarissen =
        await this.mandatarissenService.getActiveMandatarissenAtTime(
          params,
          bestuursorgaanInTijd,
          endOfDay(params.date)
        );
    }
    mandatarissen = mandatarissen.filter((mandataris) => {
      return mandataris.get('bekleedt.hasRangorde');
    });
    const mandatarisStruct = mandatarissen.map((mandataris) => {
      return { mandataris: mandataris, rangorde: mandataris.rangorde };
    });

    return {
      bestuursorgaan: parentModel.bestuursorgaan,
      bestuursorgaanInTijd,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisStruct,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.modalOpen = false;
    controller.interceptedTransition = null;
    controller.loading = false;
    controller.saved = false;
    controller.updateOrderedMandatarisList();
  }

  @action
  willTransition(transition) {
    // dude, the ember api docs say to do it like this wtf.
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controller;
    if (
      !controller.saved &&
      controller.changedEntries.length > 0 &&
      !controller.interceptedTransition
    ) {
      controller.interceptedTransition = transition;
      transition.abort();
    } else if (transition.to.name != 'organen.orgaan.edit-rangorde') {
      controller.date = null;
    }
  }
}
