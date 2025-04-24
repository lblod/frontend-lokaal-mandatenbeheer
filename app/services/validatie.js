import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';

import { typeToEmberData } from 'frontend-lmb/utils/type-to-ember-data';
import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class ValidatieService extends Service {
  @service features;
  @service store;
  @service toaster;
  @service currentSession;

  @tracked latestValidationReport;
  @tracked runningStatus;
  @tracked lastRunnningStatus;
  @tracked canShowReportIsGenerated;

  async setup() {
    if (this.features.isEnabled('shacl-report')) {
      await this.setLastRunningStatus();
      await this.setLatestValidationReport();
    }
  }

  async setLatestValidationReport() {
    this.latestValidationReport = (
      await this.store.query('report', {
        sort: '-created',
        page: { size: 1 },
        include: 'validationresults',
      })
    )[0];
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
            id: [
              ...new Set(
                value.map((i) => {
                  return i.focusNodeId;
                })
              ),
            ].join(','),
          },
          include,
        };
        if (modelName === 'bestuursorgaan') {
          query.filter['is-tijdsspecialisatie-van'] = {
            bestuurseenheid: { id: this.currentSession.group.id },
          };
        }

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
              const value = result.value?.trim();
              return {
                result,
                message: result.resultMessage,
                detail: value,
                instance,
                label: instance.validationText
                  ? await instance.validationText
                  : result.focusNode,
                context: await this.getContext(key, instance),
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

  async getContext(targetClass, instance) {
    const mapTargetClassToRoute = typeToEmberData;
    let targetId = instance?.id;
    return {
      route: mapTargetClassToRoute[targetClass].route,
      modelId: targetId,
    };
  }

  async setLastRunningStatus() {
    this.lastRunnningStatus = (
      await this.store.query('report-status', {
        'filter[:has:finished-at]': true,
        'filter[:has-no:is-flagged-as-crashed]': true,
        sort: '-finished-at',
        page: {
          size: 1,
        },
      })
    )[0];
  }

  async setRunningStatus() {
    const statuses = await this.store.query('report-status', {
      'filter[:has-no:finished-at]': true,
      'filter[:has-no:is-flagged-as-crashed]': true,
      page: {
        size: 1,
      },
    });
    this.runningStatus = statuses[0] || null;
  }

  keepPolling = task({ drop: true }, async () => {
    if (!this.runningStatus) {
      await this.setLastRunningStatus();
      await this.setLatestValidationReport();
      if (this.canShowReportIsGenerated) {
        showSuccessToast(this.toaster, 'Rapport gereed', 'Validatie rapport');
        this.canShowReportIsGenerated = false;
      }
    } else {
      const timeSinceStart =
        new Date().getTime() - this.startedPolling.getTime();
      setTimeout(
        () => {
          this.polling.perform();
        },
        timeSinceStart > 10000 ? 10000 : 1000
      );
    }
    await this.setRunningStatus();
  });

  polling = task({ drop: true }, async () => {
    this.canShowReportIsGenerated = true;
    this.startedPolling = new Date();
    this.keepPolling.perform();
  });
}
