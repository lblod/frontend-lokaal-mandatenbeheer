import Controller from '@ember/controller';

export default class CodelijstenIdController extends Controller {
  get isReadOnly() {
    return this.model.codelijst?.readOnly;
  }
}
