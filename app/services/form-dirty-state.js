import Service from '@ember/service';
import ENV from 'frontend-lmb/config/environment';

export default class FormDirtyStateService extends Service {
  dirtyForms = new Set();

  constructor() {
    super(...arguments);

    if (!ENV.APP.DISABLE_RELOAD_WARNINGS) {
      window.addEventListener('beforeunload', (e) => {
        if (this.hasDirtyForms) {
          e.preventDefault();
          e.returnValue = '';
        }
      });
    }
  }

  get hasDirtyForms() {
    return this.dirtyForms.size > 0;
  }

  markDirty(formId) {
    this.dirtyForms.add(formId);
  }

  markClean(formId) {
    this.dirtyForms.delete(formId);
  }
}
