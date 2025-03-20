import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { loadAccountData } from 'frontend-lmb/utils/account';
import {
  handleResponse,
  handleResponseSilently,
} from 'frontend-lmb/utils/handle-response';

export default class ImpersonationService extends Service {
  @service store;
  @tracked originalAccount;
  @tracked originalGroup;
  @tracked originalRoles;

  get isImpersonating() {
    return Boolean(this.originalAccount);
  }

  async load() {
    const response = await fetch('/impersonations/current');

    const result = await handleResponseSilently(response);
    if (!result) {
      return;
    }

    const originalAccountId =
      result.data.relationships['original-account'].data.id;

    const originalGroupId =
      result.data.relationships['original-session-group'].data.id;
    const [originalAccount, originalGroup] = await Promise.all([
      loadAccountData(this.store, originalAccountId),
      this.store.findRecord('bestuurseenheid', originalGroupId, {
        include: 'classificatie',
        reload: true,
      }),
    ]);

    this.originalAccount = originalAccount;
    this.originalGroup = originalGroup;
    this.originalRoles = result.data.attributes['original-session-roles'];
  }

  async impersonate(accountId) {
    const response = await fetch('/impersonations', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'impersonations',
          relationships: {
            impersonates: {
              data: {
                type: 'accounts',
                id: accountId,
              },
            },
          },
        },
      }),
    });

    await handleResponse({
      response,
      errorMessage: 'An exception occurred while trying to impersonate someone',
    });
  }

  async stopImpersonation() {
    if (this.isImpersonating) {
      const response = await fetch('/impersonations/current', {
        method: 'DELETE',
      });

      if (response.ok) {
        this.originalAccount = null;
        this.originalGroup = null;
        this.originalRoles = [];
      }
    }
  }
}
