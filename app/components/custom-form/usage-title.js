import Component from '@glimmer/component';
import { typeToEmberData } from 'frontend-lmb/utils/type-to-ember-data';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';
import { service } from '@ember/service';

export default class CustomFormUsageTitle extends Component {
  @service store;
  @use(getTitle) customTitlePromise;
  get customTitle() {
    return this.customTitlePromise?.value;
  }
}

function getTitle() {
  return trackedFunction(async () => {
    const emberInfo = typeToEmberData[this.args.usage.instanceType];
    if (!emberInfo) {
      return null;
    }
    const emberInstance = await this.store.findRecord(
      emberInfo.model,
      this.args.usage.instanceId,
      {
        include: emberInfo.include,
      }
    );

    return {
      label: emberInstance.validationText || emberInfo.model,
      route: emberInfo.route,
      id: this.args.usage.instanceId,
    };
  });
}
