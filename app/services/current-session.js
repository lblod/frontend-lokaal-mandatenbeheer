import Service from '@ember/service';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { setContext, setUser } from '@sentry/ember';
import { SHOULD_ENABLE_SENTRY } from 'frontend-lmb/utils/sentry';
import {
  BESTUURSEENHEID_CLASSIFICATIECODE_DISTRICT,
  BESTUURSEENHEID_CLASSIFICATIECODE_POLITIEZONE,
  BESTUURSEENHEID_CLASSIFICATIECODE_PROVINCIE,
} from 'frontend-lmb/utils/well-known-uris';

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
  @tracked isProvincie;
  @tracked isPolitiezone;
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
      this.isDistrict = await this.isBestuurseenheidOfClassificatie(
        BESTUURSEENHEID_CLASSIFICATIECODE_DISTRICT
      );
      this.isPolitiezone = await this.isBestuurseenheidOfClassificatie(
        BESTUURSEENHEID_CLASSIFICATIECODE_POLITIEZONE
      );
      this.isProvincie = await this.isBestuurseenheidOfClassificatie(
        BESTUURSEENHEID_CLASSIFICATIECODE_PROVINCIE
      );

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

  async isBestuurseenheidOfClassificatie(classificatieUri) {
    const classificatie = await this.group?.classificatie;
    console.log(classificatie.uri);

    return classificatie ? classificatie.uri === classificatieUri : false;
  }

  get showLegislatuurModule() {
    return (
      this.features.isEnabled('show-iv-module') &&
      !this.isDistrict &&
      !this.isProvincie &&
      !this.isPolitiezone
    );
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
