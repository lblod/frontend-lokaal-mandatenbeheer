import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SharedAlertGroupComponent extends Component {
  @tracked alerts = A();

  @action
  test() {
    console.log(`set`);
    for (const alert of this.alerts) {
      const element = document.getElementById(alert.id);
      element.style.display = alert.isVisible ? 'block' : 'none';
      console.log(`\t ele`, document.getElementById(alert.id));
    }
    console.log(`done`);
  }

  @action
  previous() {
    const current = this.alerts.findBy('isVisible', true);
    const indexOfCurrent = this.alerts.indexOf(current);
    console.log(`current: index = ${indexOfCurrent}, id = ${current.id}`);
    const savedInfoOfCurrent = current;
    delete savedInfoOfCurrent.isVisible;
    this.alerts.removeObject(current);
    this.alerts.pushObject({
      ...savedInfoOfCurrent,
      isVisible: false,
    });

    let objectToShow = null;
    if (indexOfCurrent === 0) {
      objectToShow = this.alerts.lastObject;
    } else {
      objectToShow = this.alerts.objectAt(indexOfCurrent - 1);
    }

    if (objectToShow) {
      const savedInfoOfObjectToShow = objectToShow;
      delete savedInfoOfObjectToShow.isVisible;
      this.alerts.removeObject(objectToShow);
      this.alerts.pushObject({
        ...savedInfoOfObjectToShow,
        isVisible: true,
      });
      console.log(this.alerts);
    }
  }
  @action
  next() {
    const current = this.alerts.findBy('isVisible', true);
    const indexOfCurrent = this.alerts.indexOf(current);
    console.log(`current: index = ${indexOfCurrent}, id = ${current.id}`);
    const savedInfoOfCurrent = current;
    delete savedInfoOfCurrent.isVisible;
    this.alerts.removeObject(current);
    this.alerts.pushObject({
      ...savedInfoOfCurrent,
      isVisible: false,
    });

    let objectToShow = null;
    if (indexOfCurrent + 1 === this.alerts.length) {
      objectToShow = this.alerts.firstObject;
    } else {
      objectToShow = this.alerts.objectAt(indexOfCurrent + 1);
    }

    if (objectToShow) {
      const savedInfoOfObjectToShow = objectToShow;
      delete savedInfoOfObjectToShow.isVisible;
      this.alerts.removeObject(objectToShow);
      this.alerts.pushObject({
        ...savedInfoOfObjectToShow,
        isVisible: true,
      });
      console.log(this.alerts);
    }
  }
}
