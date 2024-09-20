import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ImpersonationMenu extends Component {
  @service currentSession;
  @service impersonation;

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get icon() {
    return this.isImpersonating ? 'user-check' : 'users-single';
  }

  get user() {
    if (!this.isImpersonating) {
      return null;
    }

    return this.currentSession.user;
  }

  get adminLabel() {
    return this.isImpersonating ? `Admin: ${this.user.fullName}` : 'Admin';
  }

  stopImpersonation = async () => {
    await this.impersonation.stopImpersonation();
    window.location.reload();
  };
}
