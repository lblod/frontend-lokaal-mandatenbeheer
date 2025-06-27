import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class TablePagination extends Component {
  get page() {
    const multiplierItems = this.currentPage + 1;
    let topItems = multiplierItems * this.itemsPerPage;
    const bottomItems = topItems - this.itemsPerPage;

    if (topItems > this.totalItems) {
      topItems = this.totalItems;
    }

    return `${bottomItems} - ${topItems}`;
  }

  get totalItems() {
    return this.args.metadata?.count || null;
  }

  get currentPage() {
    return this.args.metadata?.pagination?.self?.number || this.firstPage;
  }

  get itemsPerPage() {
    return this.args.metadata?.pagination?.self?.size || 20;
  }

  get firstPage() {
    return this.args.metadata?.pagination?.first?.number || 0;
  }

  get lastPage() {
    return this.args.metadata?.pagination?.last?.number || this.firstPage;
  }

  get previousPage() {
    if (this.currentPage - 1 >= this.firstPage) {
      return this.currentPage - 1;
    }

    return this.firstPage;
  }

  get nextPage() {
    if (this.currentPage + 1 <= this.lastPage) {
      return this.currentPage + 1;
    }

    return this.args.metadata?.pagination?.next?.number ?? this.lastPage;
  }

  get isPreviousButtonHidden() {
    return this.currentPage === this.firstPage;
  }

  get isNextButtonHidden() {
    return this.currentPage === this.lastPage;
  }

  @action
  onClickPrevious() {
    this.args.onClickPrevious?.({ previousPage: this.previousPage });
  }

  @action
  onClickNext() {
    this.args.onClickNext?.({ nextPage: this.nextPage });
  }
}
