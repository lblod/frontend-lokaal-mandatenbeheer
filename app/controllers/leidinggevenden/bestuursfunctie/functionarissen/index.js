import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LeidinggevendenBestuursfunctieFunctionarissenIndexController extends Controller {
  @service() router;

  sort = 'start';
  @tracked page = 0;
  size = 10;
}
