import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class OverzichtAdminController extends Controller {
  @service currentSession;
  @service impersonation;

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get postfixBestuurseenheidLabel() {
    return this.isImpersonating ? 'Administrator ' : '';
  }

  get bestuurseenheidLabel() {
    const classificatie = this.currentSession.groupClassification?.label;
    const eenheid = this.currentSession.group.naam;

    return `${classificatie ?? ''} ${eenheid}`;
  }

  @action
  async stopImpersonation() {
    await this.impersonation.stopImpersonation();
    window.location.reload();
  }
}
