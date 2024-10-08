import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SystemNotificationLinkComponent extends Component {
  @tracked linkModels = [];

  constructor(...args) {
    super(...args);
    this.getTargetId().then((linkModels) => {
      this.linkModels = linkModels;
    });
  }

  get initialized() {
    return this.linkModels.length > 0;
  }

  @service store;
  get route() {
    switch (this.args.link.kind) {
      case 'mandataris':
        return 'mandatarissen.persoon.mandataris';
      default:
        return null;
    }
  }

  async getTargetId() {
    if (!this.route) {
      return [];
    }
    const target = await this.store.query(this.args.link.kind, {
      filter: {
        ':uri:': this.args.link.target,
      },
      include: 'is-bestuurlijke-alias-van',
      page: {
        size: 1,
      },
    });
    if (target.length === 0) {
      return [];
    }
    return [target[0]?.isBestuurlijkeAliasVan?.id, target[0]?.id];
  }
}
