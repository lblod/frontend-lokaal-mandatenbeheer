import Component from '@glimmer/component';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class AdressenregisterSelectorComponent extends Component {
  @service addressregister;

  @tracked address = null;
  @tracked addressSuggestion;
  @tracked addressesWithBusnumbers;
  @tracked addressWithBusnumber;

  constructor() {
    super(...arguments);
    this.getAddressInfo();
  }

  get isDisabledBusnumberSelect() {
    return !this.addressWithBusnumber;
  }

  async getAddressInfo() {
    const address = await this.args.address;
    if (address) {
      this.addressSuggestion =
        await this.addressregister.toAddressSuggestion(address);
      const addresses = await this.addressregister.findAll(
        this.addressSuggestion
      );
      if (addresses.length > 1) {
        const selectedAddress = addresses.find(
          (a) => a.busnumber == address.busnummer
        );
        this.addressesWithBusnumbers = [...addresses].sort(
          (a, b) => a.busnumber - b.busnumber
        );
        this.addressWithBusnumber = selectedAddress;
      } else {
        this.addressesWithBusnumbers = null;
        this.addressWithBusnumber = null;
      }
    }
  }

  selectSuggestion = task(async (addressSuggestion) => {
    this.addressesWithBusnumbers = null;
    this.addressWithBusnumber = null;
    this.addressSuggestion = addressSuggestion;

    if (addressSuggestion) {
      const addresses = await this.addressregister.findAll(addressSuggestion);
      if (addresses.length == 1) {
        this.args.onChange(addresses[0].adresProperties);
      } else {
        // selection of busnumber required
        const sortedBusNumbers = [...addresses].sort(
          (a, b) => a.busnumber - b.busnumber
        );
        this.addressesWithBusnumbers = sortedBusNumbers;
        this.addressWithBusnumber = sortedBusNumbers[0];
        this.args.onChange(this.addressWithBusnumber.adresProperties);
      }
    } else {
      this.args.onChange(null);
    }
  });

  search = task({ keepLatest: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    const addressSuggestions = await this.addressregister.suggest(searchData);
    return addressSuggestions;
  });

  @action
  selectAddressWithBusnumber(address) {
    this.addressWithBusnumber = address;
    this.args.onChange(address.adresProperties);
  }

  @action
  onClose() {
    if (this.args.isRequired) {
      this.args.onCheckRequiredValidation(null);
    }
  }
}
