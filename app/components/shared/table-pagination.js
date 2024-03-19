import Component from '@glimmer/component';

export default class SharedTablePaginationComponent extends Component {
  get startItem() {
    return this.args.page * this.args.pageSize + 1;
  }

  get isFirstPage() {
    return this.startItem === 1;
  }

  get isLastPage() {
    return (
      this.args.page * this.args.pageSize + this.args.pageSize >=
      this.args.totalItems
    );
  }

  get hasMultiplePages() {
    return !this.isFirstPage || !this.isLastPage;
  }

  get endItem() {
    return Math.min(
      this.args.page * this.args.pageSize + this.args.pageSize,
      this.args.totalItems
    );
  }
}
