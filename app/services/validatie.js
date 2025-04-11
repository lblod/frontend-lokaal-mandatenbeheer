import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';

import { typeToEmberData } from 'frontend-lmb/utils/type-to-ember-data';

export default class ValidatieService extends Service {
  @service features;
  @service store;

  @tracked latestValidationReport;
  @tracked runningStatus;
  @tracked lastRunnningStatus;

  async setup() {
    if (this.features.isEnabled('shacl-report')) {
      await this.setLastRunningStatus();
      await this.setLatestValidationReport();
    }
  }

  async setLatestValidationReport() {
    this.latestValidationReport = await this.lastRunnningStatus?.report;
    if (!this.latestValidationReport) {
      alert("didn't find the report for last status"); // Try out
      this.latestValidationReport = (
        await this.store.query('report', {
          sort: '-created',
          page: { size: 1 },
          include: 'validationresults',
        })
      )[0];
    }
  }

  async getResultsByInstance(instance) {
    const results =
      (await this.latestValidationReport?.validationresults) ?? [];
    return results.filter((result) => instance.uri === result.focusNode);
  }

  async getResultsByClass() {
    const results =
      (await this.latestValidationReport?.validationresults) ?? [];
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
            if (instance) {
              return {
                result,
                instance,
                label: instance.validationText
                  ? await instance.validationText
                  : result.focusNode,
                context: this.getContext(key, instance),
              };
            }
          })
        );
        const valuesWithAccessibleInstance = valuesWithInstance.filter(
          (result) => result
        );
        enrichedInstancesPerType.push({
          class: { uri: key, label: emberDataMapping.classLabel },
          instances: valuesWithAccessibleInstance,
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

  async setLastRunningStatus() {
    this.lastRunnningStatus = (
      await this.store.query('report-status', {
        'filter[:has:finished-at]': true,
        sort: '-finished-at',
        page: {
          size: 1,
        },
      })
    )[0];
  }

  async getRunningStatus() {
    const statuses = await this.store.query('report-status', {
      'filter[:has-no:finished-at]': true,
      page: {
        size: 1,
      },
    });
    this.runningStatus = statuses[0] || null;

    return this.runningStatus;
  }

  polling = task(async () => {
    await this.getRunningStatus();
    const interval = setInterval(async () => {
      if (!this.runningStatus) {
        clearInterval(interval);
        await this.setLastRunningStatus();
        await this.setLatestValidationReport();
        return;
      }
      await this.getRunningStatus();
    }, 1500);
  });
}
