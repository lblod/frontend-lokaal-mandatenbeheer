import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import {
  orderMandatarissenByRangorde,
  rangordeNumberMapping,
  rangordeStringMapping,
  rangordeStringToNumber,
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

  getNextAvailableRangorde() {
    const sortedMandatarissen = orderMandatarissenByRangorde([
      ...this.args.mandatarissen,
    ]);
    const lastNumber = rangordeStringToNumber(
      sortedMandatarissen[sortedMandatarissen.length - 1].rangorde
    );
    if (lastNumber) {
      return rangordeNumberMapping[lastNumber + 1];
    }
    return rangordeNumberMapping[1];
  }

  @action
  onUpdateRangorde(rangordeAsString) {
    this.setRangorde(rangordeAsString);
  }

  @action
  async rangordeUp() {
    const currentNumber = this.rangordeInteger || 0;
    const newOrder = rangordeNumberMapping[currentNumber + 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(
        `${this.getNextAvailableRangorde()} ${this.mandaatLabel}`
      );
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangorde.replace(currentOrder, newOrder));
    }
  }
  @action
  async rangordeDown() {
    const currentNumber = this.rangordeInteger || 2;
    const newOrder = rangordeNumberMapping[currentNumber - 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(
        `${this.getNextAvailableRangorde()} ${this.mandaatLabel}`
      );
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangorde.replace(currentOrder, newOrder));
    }
  }

  @action
  onEnterInRangorde(event) {
    if (event.key === 'Enter') {
      this.setRangorde(event.currentTarget.value);
    }
  }
}
