import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatarisHistoryComponent extends Component {
  @tracked loading = true;
  @tracked history = [];

  @service store;

  constructor() {
    super(...arguments);
    this.fetchCurrentHistoryPage();
  }

  async fetchCurrentHistoryPage() {
    this.history.push({
      description: `Status gewijzigd naar ${this.args.mandataris.status.get('label')}`,
      mandatarisId: this.args.mandataris.id,
    });
    this.loading = true;
    const result = await fetch(
      `/form-content/${this.args.form.id}/instances/${this.args.instanceId}/history`
    );

    const json = await result.json();
    const history = json.instances;

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

    this.history = this.history.concat(
      history.map((h) => {
        return {
          ...h,
          creator: userIdToUser[h.creator],
        };
      })
    );

    this.loading = false;
  }
}
