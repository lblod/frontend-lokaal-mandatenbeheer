import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

export default class SkeletonTableComponent extends Component {
  @tracked columns;
  @tracked rows;

  constructor() {
    super(...arguments);

    this.columns = new Array(this.args.columns ?? 1);
    this.rows = new Array(this.args.rows ?? 1);
  }
}
