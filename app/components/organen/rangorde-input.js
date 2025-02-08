import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { keepLatestTask } from 'ember-concurrency';
import {
  orderMandatarisStructByRangorde,
  rangordeNumberMapping,
  rangordeStringMapping,
  rangordeStringToNumber,
} from 'frontend-lmb/utils/rangorde';

export default class OrganenRangordeInputComponent extends Component {
  @tracked rangordePlaceholder;

  constructor() {
    super(...arguments);
    this.setPlaceholder();
  }

  get inputWarningMessage() {
    const order = this.rangordeInteger;
    if (order == null) {
      return 'Opgelet! Dit is geen gekende rangorde!';
    } else {
      return null;
    }
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
    const mandaat = await this.args.mandatarisStruct.mandataris.get('bekleedt');
    this.rangordePlaceholder = `Vul de rangorde in, bv. “Eerste ${mandaat.rangordeLabel}”`;
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

  async getMandaatLabel() {
    const mandaat = await this.args.mandatarisStruct.mandataris.get('bekleedt');
    return mandaat?.rangordeLabel;
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

  getNextAvailableRangorde() {
    const sortedMandatarissen = orderMandatarisStructByRangorde([
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
  onUpdateRangorde(event) {
    this.setRangorde(event.currentTarget.value);
  }

  @action
  async rangordeUp() {
    const currentNumber = this.rangordeInteger || 0;
    const newOrder = rangordeNumberMapping[currentNumber + 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(
        `${this.getNextAvailableRangorde()} ${await this.getMandaatLabel()}`,
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
        `${this.getNextAvailableRangorde()} ${await this.getMandaatLabel()}`,
        true
      );
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangorde.replace(currentOrder, newOrder), true);
    }
  }

  @action
  onEnterInRangorde(event) {
    if (event.key === 'Enter') {
      this.setRangorde(event.currentTarget.value);
    }
  }
}
