import Controller from '@ember/controller';

import { action } from '@ember/object';

export default class ReportController extends Controller {
  get targetClasses() {
    return Array.from(this.model.resultsByTargetClass.keys());
  }

  @action
  filterResultsByTargetClass(targetClass) {
    return this.model.resultsByTargetClass.get(targetClass);
  }

  @action
  lengthOfResultsByTargetClass(targetClass) {
    return this.filterResultsByTargetClass(targetClass).length;
  }
}
