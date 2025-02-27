import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask } from 'ember-concurrency';
import {
  getNextAvailableRangorde,
  rangordeNumberMapping,
  rangordeStringMapping,
} from 'frontend-lmb/utils/rangorde';

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
    this.rangordePlaceholder = `Selecteer een rangorde, bv. “Eerste ${this.mandaat.rangordeLabel}”`;
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

  @action
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

  findFirstWordOfString(string) {
    // eslint-disable-next-line no-useless-escape
    const regex = new RegExp(/^([\w\-]+)/);
    if (regex.test(string)) {
      return `${string}`.match(regex);
    }
    return null;
  }

  get isMinusDisabled() {
    return this.rangordeInteger <= 1;
  }

  get isPlusDisabled() {
    return this.rangordeInteger >= Object.keys(rangordeStringMapping).length;
  }

  getMandatarisWithRangorde(targetRangorde) {
    return this.args.mandatarissen.find((mandatarisStruct) => {
      return mandatarisStruct.rangorde === targetRangorde;
    });
  }

  @action
  async rangordeUp() {
    const currentNumber = this.rangordeInteger || 0;
    const newOrder = rangordeNumberMapping[currentNumber + 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(
        `${getNextAvailableRangorde(this.args.mandatarissen)} ${this.mandaatLabel}`,
        true
      );
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangorde.replace(currentOrder, newOrder), true);
    }
  }
  @action
  async rangordeDown() {
    const currentNumber = this.rangordeInteger || 2;
    const newOrder = rangordeNumberMapping[currentNumber - 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(
        `${getNextAvailableRangorde(this.args.mandatarissen)} ${this.mandaatLabel}`,
        true
      );
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangorde.replace(currentOrder, newOrder), true);
    }
  }
}
