import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatarisHistoryComponent extends Component {
  @tracked loading = true;
  @tracked history = [];

  @service store;

  constructor() {
    super(...arguments);
    this.fetchHistory();
  }

  async fetchHistory() {
    this.loading = true;
    for (const mandataris of this.args.mandatarissen) {
      this.history.push({
        description: `Status gewijzigd naar ${mandataris.status.get('label')}`,
        mandatarisId: mandataris.id,
        selected: this.args.mandataris.id == mandataris.id,
      });

      let corrections = await this.fetchHistoryForMandataris(mandataris);
      this.history = this.history.concat(corrections);
    }
    this.loading = false;
  }

  async fetchHistoryForMandataris(mandataris) {
    const result = await fetch(
      `/form-content/${this.args.form.id}/instances/${mandataris.id}/history`
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

    return history.map((h) => {
      return {
        ...h,
        creator: userIdToUser[h.creator],
      };
    });
  }
}
