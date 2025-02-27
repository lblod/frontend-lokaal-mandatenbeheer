import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask } from 'ember-concurrency';
import { rangordeStringMapping } from 'frontend-lmb/utils/rangorde';

export default class OrganenRangordeInputComponent extends Component {
  @tracked rangordePlaceholder;
  @tracked mandaat;

  constructor() {
    super(...arguments);
    this.setPlaceholder();
  }

  get rangordeInteger() {
    return this.findOrderInString(this.args.mandatarisStruct.rangorde);
  }

  get rangordeMovedUp() {
    const currentNumber = this.rangordeInteger || 0;
    const oldNumber = this.findOrderInString(
      this.args.mandatarisStruct.mandataris.rangorde
    );
    return currentNumber < oldNumber;
  }

  get rangordeMovedDown() {
    const currentNumber = this.rangordeInteger || 0;
    const oldNumber = this.findOrderInString(
      this.args.mandatarisStruct.mandataris.rangorde
    );
    return currentNumber > oldNumber;
  }

  get rangorde() {
    return this.args.mandatarisStruct.rangorde;
  }

  async setPlaceholder() {
    this.mandaat = await this.args.mandatarisStruct.mandataris.get('bekleedt');
    this.rangordePlaceholder = `Vul de rangorde in, bv. “Eerste ${this.mandaat.rangordeLabel}”`;
  }

  updateMandatarisRangorde = keepLatestTask(
    async (value, switchWithPrevious) => {
      const oldRangorde = this.args.mandatarisStruct.rangorde;
      const newRangorde = value;
      const previousHolder = this.getMandatarisWithRangorde(newRangorde);

      this.args.mandatarisStruct.rangorde = newRangorde;

      if (
        switchWithPrevious &&
        previousHolder &&
        previousHolder !== this.args.mandatarisStruct.mandataris
      ) {
        previousHolder.rangorde = oldRangorde;
      }
      this.args.updateMandatarisList();
    }
  );

  setRangorde(value, switchWithPrevious = false) {
    this.updateMandatarisRangorde.perform(value, switchWithPrevious);
  }

  get mandaatLabel() {
    return this.mandaat?.rangordeLabel;
  }

  findOrderInString(possibleString) {
    if (!possibleString || typeof possibleString != 'string') {
      return null;
    }
    let foundNumber = null;
    Object.keys(rangordeStringMapping).forEach((key) => {
      if (possibleString.startsWith(key)) {
        foundNumber = rangordeStringMapping[key];
      }
    });
    return foundNumber;
  }

  getMandatarisWithRangorde(targetRangorde) {
    return this.args.mandatarissen.find((mandatarisStruct) => {
      return mandatarisStruct.rangorde === targetRangorde;
    });
  }

  @action
  onUpdateRangorde(rangordeAsString) {
    this.setRangorde(rangordeAsString);
  }
}
