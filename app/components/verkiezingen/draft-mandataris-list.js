import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class DraftMandatarisListComponent extends Component {
  @tracked isModalOpen = false;
  @tracked mandataris;
  @tracked editBeleidsdomeinen;
  @tracked editRangorde;

  @action
  openModal(mandataris) {
    this.mandataris = mandataris;
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.mandataris = null;
  }

  @action
  openEditRangorde(mandataris) {
    this.mandataris = mandataris;
    this.editRangorde = mandataris.id;
    this.editRangordeValue = mandataris.rangorde;
  }

  validateRangorde = restartableTask(async (event) => {
    await timeout(200);

    const inputValue = event.target?.value;

    if (!inputValue) {
      return;
    }
    const firstWord = this.findFirstWordOfString(inputValue);
    if (!firstWord) {
      return;
    }

    if (
      Object.keys(this.rangordeAsStringMapping).includes(
        firstWord.input?.toLowerCase()
      )
    ) {
      console.log(`first word is a number`, firstWord.input);
      console.log(`number is`, this.rangordeAsStringMapping[firstWord.input]);
    } else {
      const intValue = parseInt(firstWord);
      if (!intValue) {
        // show warning
        return;
      }
      console.log({ intValue });
    }
  });

  get rangordeAsStringMapping() {
    return {
      eerste: 1,
      tweede: 2,
      derde: 3,
      vierde: 4,
      vijfde: 5,
      zesde: 6,
      zevende: 7,
      achtste: 8,
      negende: 9,
    };
  }

  findFirstWordOfString(string) {
    // eslint-disable-next-line no-useless-escape
    const regex = new RegExp(/^([\w\-]+)/);
    if (regex.test(string)) {
      return string.match(regex);
    }
    return null;
  }

  @action
  closeEditRangorde() {
    this.mandataris = null;
    this.editRangorde = null;
  }

  @action
  openEditBeleidsdomeinen(mandataris) {
    this.mandataris = mandataris;
    this.editBeleidsdomeinen = mandataris.id;
    addEventListener('keyup', this.handleKeyDownBeleidsdomeinen);
  }

  @action
  handleKeyDownBeleidsdomeinen(event) {
    if (event.code == 'Escape' || event.code == 'Tab') {
      this.closeEditBeleidsdomeinen();
    }
  }

  @action
  closeEditBeleidsdomeinen() {
    removeEventListener('keyup', this.handleKeyDownBeleidsdomeinen);
    this.mandataris = null;
    this.editBeleidsdomeinen = null;
  }

  @action
  async updateBeleidsdomeinen(selectedBeleidsdomeinen) {
    this.mandataris.beleidsdomein = await selectedBeleidsdomeinen;
    await this.mandataris.save();
  }

  @action
  async updatePerson(person) {
    this.mandataris.isBestuurlijkeAliasVan = person;
    await this.mandataris.save();
    this.closeModal();
  }
}
