import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { createKeyValueState } from 'frontend-lmb/utils/create-codelist-state';
import { queryRecord } from 'frontend-lmb/utils/query-record';

export default class CodelijstenDetailRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service conceptSchemeApi;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const codelijst = await queryRecord(this.store, 'concept-scheme', {
      'filter[:id:]': params.id,
      include: 'concepts',
      reload: true,
    });
    const concepten = (await codelijst?.concepts) ?? [];

    let implementations = null;

    if (!codelijst.isReadOnly) {
      implementations =
        await this.conceptSchemeApi.conceptSchemeHasImplementations(
          codelijst.id
        );
    }

    return {
      ogCodelistName: codelijst.label,
      codelijst,
      concepten,
      keyValueState: createKeyValueState(codelijst, concepten),
      implementations,
    };
  }

  @action
  willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controller;
    if (controller.hasChanges) {
      transition.abort();
      controller.isUnsavedChangesModalOpen = true;
      controller.savedTransition = transition;
    }
  }
}
