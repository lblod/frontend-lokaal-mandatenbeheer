import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask} from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class MandatarisHistoryComponent extends Component {
  @tracked loading = true;
  @tracked history = [];

  @service store;

  constructor() {
    super(...arguments);
    this.fetchCurrentHistoryPage.perform();
  }

  @keepLatestTask
  *fetchCurrentHistoryPage() {
    this.loading = true;
    const result = yield fetch(
      `/form-content/${this.args.form.id}/instances/${this.args.instanceId}/history`
    );

    const json = yield result.json();
    const history = json.instances;

    const userIds = new Set([...history.map((h) => h.creator)]);
    let users = [];
    if (userIds.size !== 0) {
      users = yield this.store.query('gebruiker', {
        filter: {
          id: Array.from(userIds).join(','),
        },
      });
    }

    const userIdToUser = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    this.history = history.map((h) => {
      return {
        ...h,
        creator: userIdToUser[h.creator],
      };
    });

    this.loading = false;
  }
}
