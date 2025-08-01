import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import SilencedValidationModel from 'frontend-lmb/models/silenced-validation';

export default class ValidationReportRow extends Component {
  @tracked collapsed = true;
  @service store;
  @service validatie;
  @service currentSession;

  get activeSilencer() {
    return this.args.result.result.silencer;
  }

  @action
  async toggleHidden() {
    if (this.activeSilencer) {
      await this.activeSilencer.destroyRecord();
      this.hiddenResult = null;
    } else {
      const result = this.args.result;
      const ignorer = this.store.createRecord('silenced-validation', {
        bestuurseenheid: this.currentSession.group,
        sourceShape: result.result.sourceShape,
        focusNodeId: result.result.focusNodeId,
        silencedAt: new Date(),
        validationKey: SilencedValidationModel.buildKey(result.result),
      });
      await ignorer.save();
    }

    await this.validatie.setLatestValidationReport();
  }

  @action
  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}
