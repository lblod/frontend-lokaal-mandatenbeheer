import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LeidinggevendenBestuursfunctieFunctionarissenIndexController extends Controller {
  @service() router;

  sort = 'start';
  @tracked page = 0;
  size = 10;

  @action
  handleVoegNieuweAanstellingsperiodeClick() {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen.new'
    );
  }
}
