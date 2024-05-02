import Component from '@glimmer/component';

import { restartableTask, timeout } from 'ember-concurrency';

export default class VerkiezingenRangordeInputComponent extends Component {
  transformRangorde = restartableTask(async (event) => {
    await timeout(200);

    let possibleOrder = this.findOrderInString(event.target?.value);

    if (!possibleOrder) {
      console.warn(`Geen getal gevonden in input veld`);
      return;
    }

    console.log({ possibleOrder });
  });

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
}
