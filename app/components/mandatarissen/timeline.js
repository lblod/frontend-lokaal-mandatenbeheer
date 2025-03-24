import Component from '@glimmer/component';
import { service } from '@ember/service';
import moment from 'moment';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

async function getCorrections(mandataris) {
  const result = await fetch(
    `/form-content/mandataris-edit/instances/${mandataris.id}/history`
  );

  const json = await result.json();
  return json.instances;
}
function getHistory() {
  return trackedFunction(async () => {
    const mandatarissen = this.args.mandatarissen;
    const newHistory = await Promise.all(
      mandatarissen.map(async (mandataris) => {
        let corrections = await getCorrections(mandataris);
        const historyEntry = {
          mandataris,
          corrections,
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

    return newHistory
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
}

export default class MandatarissenTimeline extends Component {
  @service features;
  @service store;

  @use(getHistory) history;

  get isFeatureEnabled() {
    return this.features.isEnabled('shacl-report');
  }

  get timelineEvents() {
    const mandatarissen = this.args.mandatarissen;
    const sortedMandatarissen = mandatarissen.sortBy('start');
    const events = sortedMandatarissen.map((mandataris, index) => {
      return {
        type: index > 0 ? 'Wijziging' : 'Aanmaak',
        active: mandataris.isCurrentlyActive,
        date: mandataris.start,
        mandataris,
        selected: mandataris.id === this.args.mandataris.id,
      };
    });
    const lastMandataris = sortedMandatarissen[sortedMandatarissen.length - 1];
    if (lastMandataris.einde) {
      events.push({
        type: 'Einde',
        active: moment().isAfter(lastMandataris.einde),
        date: lastMandataris.einde,
        mandataris: lastMandataris,
        selected: false,
      });
    }
    if (this.history?.value) {
      events.forEach((event) => {
        event.corrections = this.history.value.find(
          (h) => h.mandataris.id === event.mandataris.id
        )?.corrections;
      });
    }
    events[events.length - 1].last = true;
    return events;
  }
}
