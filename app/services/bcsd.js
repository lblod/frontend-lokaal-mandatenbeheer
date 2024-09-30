import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class bcsdService extends Service {
  @service store;

  @tracked
  recomputeBCSDNeededTime = null;

  forceRecomputeBCSD() {
    this.recomputeBCSDNeededTime = new Date();
  }
}
