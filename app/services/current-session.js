import Service from '@ember/service';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { setContext, setUser } from '@sentry/ember';
import { SHOULD_ENABLE_SENTRY } from 'frontend-lmb/utils/sentry';
import { BESTUURSEENHEID_CLASSIFICATIECODE_DISTRICT } from 'frontend-lmb/utils/well-known-uris';

const MODULE = {
  MANDATENBEHEER: 'LoketLB-mandaatGebruiker',
};

const ADMIN_ROLE = 'LoketLB-admin';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service impersonation;
  @service features;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked groupClassification;
  @tracked isDistrict;
  @tracked roles = [];

  async load() {
    if (this.session.isAuthenticated) {
      await this.impersonation.load();

      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'gebruiker',
      });

      this.user = this.account.gebruiker;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('bestuurseenheid', groupId, {
        include: 'classificatie',
        reload: true,
      });
      this.groupClassification = await this.group.classificatie;
      this.isDistrict = await this.isDistrictBestuurseenheid();

      this.setupSentrySession();
    }
  }

  setupSentrySession() {
    if (SHOULD_ENABLE_SENTRY) {
      let account;
      let user;
      let group;
      let groupClassification;
      let roles;

      if (this.impersonation.isImpersonating) {
        account = this.impersonation.originalAccount;
        user = account.gebruiker;
        group = this.impersonation.originalGroup;
        groupClassification = group.belongsTo('classificatie').value();
        roles = this.impersonation.originalRoles;
      } else {
        account = this.account;
        user = this.user;
        group = this.group;
        groupClassification = this.groupClassification;
        roles = this._roles;
      }

      // eslint-disable-next-line camelcase
      setUser({ id: this.user.id, ip_address: null });
      setContext('session', {
        account: account.id,
        user: user.id,
        group: group.uri,
        groupClassification: groupClassification.uri,
        roles: roles,
      });
    }
  }

  canAccess(role) {
    return this.roles.includes(role);
  }

  async isDistrictBestuurseenheid() {
    const classificatie = await this.group?.classificatie;

    return classificatie
      ? classificatie.uri === BESTUURSEENHEID_CLASSIFICATIECODE_DISTRICT
      : false;
  }

  get showLegislatuurModule() {
    return this.features.isEnabled('show-iv-module') && !this.isDistrict;
  }

  get canAccessMandaat() {
    return this.canAccess(MODULE.MANDATENBEHEER);
  }

  get isAdmin() {
    let roles = this.roles;
    if (this.impersonation.isImpersonating) {
      roles = this.impersonation.originalRoles || [];
    }
    return roles.includes(ADMIN_ROLE);
  }

  get showAdminFeatures() {
    return this.isAdmin && !this.impersonation.isImpersonating;
  }
}
