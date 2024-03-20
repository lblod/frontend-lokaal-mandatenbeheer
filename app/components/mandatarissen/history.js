import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class MandatarisHistoryComponent extends Component {
  @tracked loading = true;
  @tracked page = 0;
  @tracked size = 10;
  @tracked history = [];
  @tracked totalCount = 0;

  @service store;

  constructor() {
    super(...arguments);
    this.fetchCurrentHistoryPage.perform();
  }

  @keepLatestTask
  *fetchCurrentHistoryPage() {
    this.loading = true;
    const result = yield fetch(
      `/form-content/${this.args.formId}/instances/${this.args.instanceId}/history?page[size]=${this.size}&page[number]=${this.page}`
    );

    const json = yield result.json();
    const history = json.instances;
    this.totalCount = parseInt(result.headers.get('X-Total-Count'), 10);

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

  @dropTask
  *restoreHistoryItem(historyItem) {
    const result = yield fetch(
      `/form-content/history?historyUri=${historyItem.history}`
    );
    const json = yield result.json();

    this.args.onRestore(json);
  }

  @action
  toNextPage() {
    this.page = this.page + 1;
    this.fetchCurrentHistoryPage.perform();
  }

  @action
  toPreviousPage() {
    this.page = this.page - 1;
    this.fetchCurrentHistoryPage.perform();
  }
}
