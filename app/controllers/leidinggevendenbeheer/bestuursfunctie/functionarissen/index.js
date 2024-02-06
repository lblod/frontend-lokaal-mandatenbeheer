import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenIndexController extends Controller {
  @service() router;

  sort = 'start';
  page = 0;
  size = 20;

  @action
  handleVoegNieuweAanstellingsperiodeClick() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen.new'
    );
  }
}
