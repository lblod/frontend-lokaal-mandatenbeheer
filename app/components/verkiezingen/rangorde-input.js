import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import {
  getNextAvailableRangorde,
  rangordeNumberMapping,
  rangordeStringMapping,
} from 'frontend-lmb/utils/rangorde';

export default class VerkiezingenRangordeInputComponent extends Component {
  @tracked rangordePlaceholder;
  @tracked mandaat;

  constructor() {
    super(...arguments);
    this.setPlaceholder();
  }

  get rangordeInteger() {
    return this.findOrderInString(this.args.mandataris.rangorde);
  }

  get rangorde() {
    return this.args.mandataris.rangorde;
  }

  async setPlaceholder() {
    this.mandaat = await this.args.mandataris.bekleedt;
    this.rangordePlaceholder = `Selecteer een rangorde, bv. “Eerste ${this.mandaat.rangordeLabel}”`;
  }

  updateMandatarisRangorde = keepLatestTask(
    async (value, switchWithPrevious) => {
      const oldRangorde = this.args.mandataris.rangorde;
      const newRangorde = value;
      const previousHolder = this.getMandatarisWithRangorde(newRangorde);
      this.args.mandataris.rangorde = newRangorde;

      const promises = [this.args.mandataris.save()];

      if (
        switchWithPrevious &&
        previousHolder &&
        previousHolder !== this.args.mandataris
      ) {
        previousHolder.rangorde = oldRangorde;
        promises.push(previousHolder.save());
      }
      await Promise.all(promises);
      await timeout(SEARCH_TIMEOUT);
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
    return this.args.mandatarissen.find((mandataris) => {
      return mandataris.rangorde === targetRangorde;
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
