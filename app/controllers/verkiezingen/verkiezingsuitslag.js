import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { action } from '@ember/object';

export default class VerkiezingenVerkiezingsuitslagController extends Controller {
  @service router;
  @service store;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'plaats-rangorde';
  size = 20;

  @tracked searchData;

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  });

  @action
  async selectStatus(status) {
    const installatievergadering = this.model.installatievergadering;
    installatievergadering.status = status;
    await installatievergadering.save();
    this.send('reloadModel');
  }
}
