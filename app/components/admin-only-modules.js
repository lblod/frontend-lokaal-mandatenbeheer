import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AdminOnlyModulesComponent extends Component {
  @service currentSession;
  @service impersonation;

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get isAdmin() {
    return this.currentSession.isAdmin;
  }

  @action
  async stopImpersonation() {
    await this.impersonation.stopImpersonation();
    window.location.reload();
  }
}
