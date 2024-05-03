import Component from '@glimmer/component';

import { action } from '@ember/object';
import { keepLatestTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import {
  rangordeNumberMapping,
  rangordeStringMapping,
} from 'frontend-lmb/utils/rangorde';

export default class VerkiezingenRangordeInputComponent extends Component {
  @tracked rangordeInput;

  isRangordeWrittenAsString;

  constructor() {
    super(...arguments);

    this.rangordeInput = this.args.mandataris.rangorde;
  }

  get inputWarningMessage() {
    const order = this.rangordeInteger;
    if (order == null) {
      return 'Opgelet! Dit is geen geldige rangorde!';
    } else {
      return null;
    }
  }

  get rangordeInteger() {
    return this.findOrderInString(this.rangordeInput);
  }

  updateMandatarisRangorde = keepLatestTask(async () => {
    await timeout(SEARCH_TIMEOUT);
    this.args.mandataris.rangorde = this.rangordeInput;
    await this.args.mandataris.save();
  });

  setRangorde(value) {
    this.rangordeInput = value;
    this.updateMandatarisRangorde.perform();
  }

  async getMandaatLabel() {
    const label = await this.args.mandataris.get(
      'bekleedt.bestuursfunctie.label'
    );
    return label.toLowerCase();
  }

  findOrderInString(possibleString) {
    if (!possibleString) {
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
    return this.rangordeInteger >= 20;
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
      this.setRangorde(`${newOrder} ${await this.getMandaatLabel()}`);
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangordeInput.replace(currentOrder, newOrder));
    }
  }
  @action
  async rangordeDown() {
    const currentNumber = this.rangordeInteger || 2;
    const newOrder = rangordeNumberMapping[currentNumber - 1];

    if (this.rangordeInteger == null) {
      this.setRangorde(`${newOrder} ${await this.getMandaatLabel()}`);
    } else {
      const currentOrder = rangordeNumberMapping[currentNumber];
      this.setRangorde(this.rangordeInput.replace(currentOrder, newOrder));
    }
  }
}
