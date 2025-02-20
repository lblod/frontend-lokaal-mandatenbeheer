import Controller from '@ember/controller';

export default class CodelijstenDetailController extends Controller {
  get title() {
    return this.model.codelijst?.isReadOnly
      ? this.model.codelijst.label
      : 'Bewerk codelijst';
  }
}
