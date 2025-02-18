import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { typeToEmberData } from 'frontend-lmb/utils/type-to-ember-data';

export default class ReportRoute extends Route {
  @service store;
  @service router;
  @service features;
  @service session;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.features.isEnabled('shacl-report')) {
      this.router.replaceWith('index');
    }
  }

  async model() {
    const latestReport = (
      await this.store.query('report', {
        sort: '-created',
        page: { size: 1 },
        include: 'validationresults',
      })
    )[0];

    return {
      report: latestReport,
      resultsByTargetClass: await this.getResultsByClass(latestReport),
    };
  }

  async getResultsByClass(report) {
    const results = (await report?.validationresults) ?? [];
    const instancesPerType = new Map();

    for (const result of results) {
      const currentResult =
        instancesPerType.get(result.targetClassOfFocusNode) ?? [];
      instancesPerType.set(
        result.targetClassOfFocusNode,
        currentResult.concat(result)
      );
    }

    // [ {class: { uri: mandaat:Mandataris, label}, instances: [{instance?, result, context?, label}]}]
    const enrichedInstancesPerType = [];
    await Promise.all(
      instancesPerType.entries().map(async ([key, value]) => {
        const emberDataMapping = typeToEmberData[key];
        if (!emberDataMapping) {
          enrichedInstancesPerType.push({
            class: { uri: key, label: key },
            instances: value.map((r) => {
              return {
                result: r,
                label: r.focusNode,
              };
            }),
          });
          return;
        }
        const modelName = emberDataMapping.model;
        const include = emberDataMapping.include;
        const query = {
          filter: {
            id: value
              .map((i) => {
                return i.focusNodeId;
              })
              .join(','),
          },
          include,
        };

        const instances = await this.store.query(modelName, query);
        if (instances.length === 0) {
          // no instances found, probably because of seas not giving us access. We generate the report for both ocmw and gemeente
          return;
        }

        const valuesWithInstance = await Promise.all(
          value.map(async (result) => {
            const instance = instances.find(
              (instance) => instance.uri === result.focusNode
            );
            return {
              result,
              instance,
              label: instance.validationText
                ? await instance.validationText
                : result.focusNode,
              context: this.getContext(key, instance),
            };
          })
        );
        enrichedInstancesPerType.push({
          class: { uri: key, label: emberDataMapping.classLabel },
          instances: valuesWithInstance,
        });
      })
    );
    return enrichedInstancesPerType;
  }

  getContext(targetClass, instance) {
    const mapTargetClassToRoute = typeToEmberData;
    return {
      route: mapTargetClassToRoute[targetClass].route,
      modelId: instance?.id,
    };
  }
}
