import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ReportController extends Controller {
  @service store;

  get targetClasses() {
    return Array.from(this.model.resultsByTargetClass.keys());
  }

  getValueFromValidationResult(result) {
    let value = '';
    if (result.value) {
      value = result.value;
    } else if (result.resultPath) {
      value = result.resultPath;
    }
    return value;
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
      'http://www.w3.org/ns/person#Person': {
        route: 'mandatarissen.persoon.mandaten',
        model: 'persoon',
      },
      'http://data.vlaanderen.be/ns/besluit#Bestuursorgaan': {
        route: 'organen.orgaan',
        model: 'bestuursorgaan',
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

  getLabelFromTargetClass(targetClass) {
    const mapTargetClassToLabel = {
      'http://data.vlaanderen.be/ns/mandaat#Mandataris': 'Mandataris',
      'http://www.w3.org/ns/person#Person': 'Persoon',
      'http://data.vlaanderen.be/ns/besluit#Bestuursorgaan': 'Bestuursorgaan'
    };
    return mapTargetClassToLabel[targetClass] ?? targetClass;
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
