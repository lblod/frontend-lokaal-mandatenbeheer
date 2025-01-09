import Controller from '@ember/controller';

import { service } from '@ember/service';
import { action } from '@ember/object';

import ENV from 'frontend-lmb/config/environment';

export default class SessionExpiredController extends Controller {
  @service session;
  @service router;

  @action
  async clearSessionAndLogin() {
    let wasMockLoginSession = this.session.isMockLoginSession;
    await this.session.invalidate();
    let logoutUrl = wasMockLoginSession
      ? this.router.urlFor('mock-login')
      : buildLogoutUrl(ENV.acmidm);

    window.location.replace(logoutUrl);
  }
}

function buildLogoutUrl({ logoutUrl, clientId }) {
  let switchUrl = new URL(logoutUrl);
  let searchParams = switchUrl.searchParams;

  searchParams.append('client_id', clientId);
  searchParams.append(
    'post_logout_redirect_uri',
    `${window.location.protocol}//${window.location.host}/login`
  );

  return switchUrl.href;
}
