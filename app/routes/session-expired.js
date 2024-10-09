import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionExpiredRoute extends Route {
  @service session;

  async beforeModel() {
    await this.session.invalidate();
  }
}
