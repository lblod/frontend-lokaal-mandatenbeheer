import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class VerkiezingenRangordeInputComponent extends Component {
  @tracked rangordePlaceholder;
  @tracked mandaat;

  constructor() {
    super(...arguments);
    this.setPlaceholder();
  }

  get rangorde() {
    return this.args.mandataris.rangorde;
  }

  async setPlaceholder() {
    this.mandaat = await this.args.mandataris.bekleedt;
    this.rangordePlaceholder = `Vul de rangorde in, bv. “Eerste ${this.mandaat.rangordeLabel}”`;
  }

  updateMandatarisRangorde = keepLatestTask(async (value) => {
    const oldRangorde = this.args.mandataris.rangorde;
    const newRangorde = value;
    const previousHolder = this.getMandatarisWithRangorde(newRangorde);
    this.args.mandataris.rangorde = newRangorde;

    const promises = [this.args.mandataris.save()];

    if (previousHolder && previousHolder !== this.args.mandataris) {
      previousHolder.rangorde = oldRangorde;
      promises.push(previousHolder.save());
    }
    await Promise.all(promises);
    await timeout(SEARCH_TIMEOUT);
  });

  setRangorde(value) {
    this.updateMandatarisRangorde.perform(value);
  }

  get mandaatLabel() {
    return this.mandaat?.rangordeLabel;
  }

  getMandatarisWithRangorde(targetRangorde) {
    return this.args.mandatarissen.find((mandataris) => {
      return mandataris.rangorde === targetRangorde;
    });
  }

  @action
  onUpdateRangorde(rangordeAsString) {
    this.setRangorde(rangordeAsString);
  }
}
