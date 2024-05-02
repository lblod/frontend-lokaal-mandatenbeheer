import Component from '@glimmer/component';

import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class VerkiezingenRangordeInputComponent extends Component {
  @tracked rangordeInteger;
  @tracked inputWarningMessage;

  constructor() {
    super(...arguments);

    this.rangordeInteger = this.findOrderInString(this.args.rangorde ?? null);
  }

  transformRangorde = restartableTask(async (event) => {
    await timeout(200);

    const inputValue = event.target?.value;
    this.rangordeInteger = this.findOrderInString(inputValue);

    if (inputValue && !this.rangordeInteger) {
      this.inputWarningMessage = `We kunnen geen rangorde vinden`;
    } else {
      this.inputWarningMessage = null;
    }
    console.log(`Rangorde in transform:`, this.rangordeInteger);
  });

  @action
  rangordeUp() {
    this.rangordeInteger += 1;
  }
  @action
  rangordeDown() {
    this.rangordeInteger -= 1;
  }

  findOrderInString(possibleString) {
    if (!possibleString) {
      return null;
    }

    const firstWord = this.findFirstWordOfString(possibleString);
    if (!firstWord) {
      return null;
    }

    const lowercaseWord = firstWord.input?.toLowerCase();
    if (Object.keys(this.rangordeAsStringMapping).includes(lowercaseWord)) {
      return this.rangordeAsStringMapping[lowercaseWord];
    } else {
      return parseInt(lowercaseWord);
    }
  }

  findFirstWordOfString(string) {
    // eslint-disable-next-line no-useless-escape
    const regex = new RegExp(/^([\w\-]+)/);
    if (regex.test(string)) {
      return string.match(regex);
    }
    return null;
  }

  get rangordeAsStringMapping() {
    return {
      eerste: 1,
      tweede: 2,
      derde: 3,
      vierde: 4,
      vijfde: 5,
      zesde: 6,
      zevende: 7,
      achtste: 8,
      negende: 9,
    };
  }

  get isMinusDisabled() {
    return !this.rangordeInteger || this.rangordeInteger <= 1;
  }

  get isPlusDisabled() {
    return !this.rangordeInteger;
  }
}
