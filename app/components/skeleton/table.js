import Component from '@glimmer/component';

export default class SkeletonTableComponent extends Component {
  get columns() {
    return new Array(this.args.columns ?? 1);
  }
  get rows() {
    return new Array(this.args.rows ?? 1);
  }
}
