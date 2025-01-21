import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ReportController extends Controller {
  @service store;

  get targetClasses() {
    return Array.from(this.model.resultsByTargetClass.keys());
  }

  @action
  filterResultsByTargetClass(targetClass) {
    return this.model.resultsByTargetClass.get(targetClass);
  }

  @action
  lengthOfResultsByTargetClass(targetClass) {
    return this.filterResultsByTargetClass(targetClass).length;
  }

  @action
  async getFocusNodeContext(focusNode, targetClass) {
    const mapTargetClassToRoute = {
      'http://data.vlaanderen.be/ns/mandaat#Mandataris': {
        route: 'mandatarissen.mandataris',
        model: 'mandataris',
      },
    };
    return {
      route: mapTargetClassToRoute[targetClass].route,
      modelId: await this.searchModelIdForFocusNode(
        mapTargetClassToRoute[targetClass].model,
        focusNode
      ),
    };
  }

  async searchModelIdForFocusNode(modelName, focusNode) {
    return (
      await this.store.query(modelName, {
        filter: {
          ':uri:': focusNode,
        },
      })
    )?.at(0)?.id;
  }
}
