import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PrepareInstallatievergaderingController extends Controller {
  @action
  async selectStatus(status) {
    const installatievergadering = this.model.installatievergadering;
    installatievergadering.status = status;
    await installatievergadering.save();
  }
}
