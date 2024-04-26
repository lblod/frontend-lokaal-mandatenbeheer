import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormsRoute extends Route {
  @service session;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const response = await fetch('/form-content/forms');
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const form = await response.json();
    return form.formDirectories;
  }
}
