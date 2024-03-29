import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class FormHistoryComponent extends Component {
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
  async fetchCurrentHistoryPage() {
    this.loading = true;
    const result = await fetch(
      `/form-content/${this.args.form.id}/instances/${this.args.instanceId}/history?page[size]=${this.size}&page[number]=${this.page}`
    );

    const json = await result.json();
    const history = json.instances;
    this.totalCount = parseInt(result.headers.get('X-Total-Count'), 10);

    const userIds = new Set([...history.map((h) => h.creator)]);
    let users = [];
    if (userIds.size !== 0) {
      users = await this.store.query('gebruiker', {
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
  async restoreHistoryItem(historyItem) {
    const result = await fetch(
      `/form-content/history?historyUri=${historyItem.history}`
    );
    const json = await result.json();

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
