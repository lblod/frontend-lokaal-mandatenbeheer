import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class OverzichtAdminController extends Controller {
  @service currentSession;
  @service impersonation;

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get bestuurseenheidLabel() {
    const postfix = this.isImpersonating ? 'Administrator ' : '';
    const classificatie = this.currentSession.groupClassification?.label;
    const eenheid = this.currentSession.group.naam;

    return `${postfix}${classificatie ?? ''} ${eenheid}`;
  }
}
