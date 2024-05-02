import Component from '@glimmer/component';

import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class VerkiezingenRangordeInputComponent extends Component {
  @tracked rangordeInput;
  @tracked rangordeInteger;
  @tracked inputWarningMessage;

  isRangordeWrittenAsString;

  constructor() {
    super(...arguments);

    this.rangordeInput = this.args.rangorde;
    this.rangordeInteger = this.findOrderInString(this.args.rangorde ?? null);
  }

  transformRangorde = restartableTask(async (event) => {
    await timeout(250);

    this.rangordeInput = event.target?.value;
    this.rangordeInteger = this.findOrderInString(this.rangordeInput);

    if (this.rangordeInput && !this.rangordeInteger) {
      this.inputWarningMessage = `We kunnen geen rangorde vinden`;
    } else {
      this.inputWarningMessage = null;
    }
    this.setRangorde();
  });

  setRangorde() {
    if (
      !Object.values(this.rangordeAsStringMapping).includes(
        this.rangordeInteger
      )
    ) {
      this.inputWarningMessage = `Dit is geen geldige rangorde`;
      return;
    }
    this.inputWarningMessage = null;

    if (this.isRangordeWrittenAsString) {
      const index = Object.values(this.rangordeAsStringMapping).indexOf(
        this.rangordeInteger
      );
      this.rangordeInput = Object.keys(this.rangordeAsStringMapping)[index];
    } else {
      this.rangordeInput = this.rangordeInteger;
    }

    this.args.updatedRangorde(this.rangordeInput);
  }

  @action
  rangordeUp() {
    this.rangordeInteger += 1;
    this.setRangorde();
  }
  @action
  rangordeDown() {
    this.rangordeInteger -= 1;
    this.setRangorde();
  }

  findOrderInString(possibleString) {
    this.isRangordeWrittenAsString = false;
    if (!possibleString) {
      return null;
    }

    const firstWord = this.findFirstWordOfString(possibleString);
    if (!firstWord) {
      return null;
    }

    const lowercaseWord = firstWord.input?.toLowerCase();
    if (Object.keys(this.rangordeAsStringMapping).includes(lowercaseWord)) {
      this.isRangordeWrittenAsString = true;
      return this.rangordeAsStringMapping[lowercaseWord];
    } else {
      return parseInt(lowercaseWord);
    }
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
    return !this.rangordeInteger || this.rangordeInteger <= 1;
  }

  get isPlusDisabled() {
    return !this.rangordeInteger;
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
      tiende: 10,
      elfde: 11,
      twaalfde: 12,
      dertiende: 13,
      veertiende: 14,
      vijftiende: 15,
      zestiende: 16,
      zeventiende: 17,
      achtiende: 18,
      negentiende: 19,
      twintigste: 20,
    };
  }
}
