import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { restartableTask } from 'ember-concurrency';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

export default class MandatarisHistoryComponent extends Component {
  @tracked history = [];

  @service store;

  constructor() {
    super(...arguments);
    this.fetchHistory.perform();
  }

  fetchHistory = restartableTask(async () => {
    const allMandatarissen = this.args.mandatarissen;
    const newHistory = await Promise.all(
      allMandatarissen.map(async (mandataris) => {
        let corrections = await this.fetchHistoryForMandataris(mandataris);
        const historyEntry = {
          mandataris,
          corrections,
          selected: this.args.mandataris?.id === mandataris.id,
        };
        return historyEntry;
      })
    );

    const userIdsInHistory = new Set();
    newHistory.forEach((h) => {
      h.corrections.forEach((c) => {
        userIdsInHistory.add(c.creator);
      });
    });

    let users = [];
    if (userIdsInHistory.size !== 0) {
      users = await this.store.query('gebruiker', {
        filter: {
          id: Array.from(userIdsInHistory).join(','),
        },
      });
    }

    const userIdToUser = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    this.history = newHistory
      .map((h) => {
        return {
          ...h,
          corrections: h.corrections.map((c) => ({
            ...c,
            creator: userIdToUser[c.creator],
          })),
        };
      })
      .sort((a, b) => {
        if (!b?.mandataris?.start) {
          return -1;
        }
        if (!a?.mandataris?.start) {
          return 1;
        }
        return b.mandataris.start.getTime() - a.mandataris.start.getTime();
      });
  });

  get toonBeleidsdomeinen() {
    return this.history.some((h) => h.mandataris.beleidsdomein.length > 0);
  }

  get toonRangorde() {
    return this.history.some((h) => h.mandataris.rangorde);
  }

  async fetchHistoryForMandataris(mandataris) {
    const result = await fetch(
      `/form-content/${this.args.form.id}/instances/${mandataris.id}/history`
    );

    const parsedResponse = handleResponse(result);
    return parsedResponse.instances;
  }

  @action
  async onMandatarisUpdate() {
    await this.fetchHistory.perform();
  }
}
