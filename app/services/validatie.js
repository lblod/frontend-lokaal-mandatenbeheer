import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';

import { typeToEmberData } from 'frontend-lmb/utils/type-to-ember-data';
import { timeout } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import moment from 'moment';

export default class ValidatieService extends Service {
  @service features;
  @service store;
  @service toaster;
  @service currentSession;
  @service router;

  @tracked latestValidationReport;
  @tracked latestValidationResults;
  @tracked runningStatus;
  @tracked lastRunnningStatus;
  @tracked canShowReportIsGenerated;
  @tracked warmingUp = false;

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
      })
    )[0];

    if (!this.latestValidationReport || !this.currentSession.group) {
      this.latestValidationResults = [];
      return;
    }

    const response = await fetch(
      `/validation-report-api/reports/${this.latestValidationReport.id}/${this.currentSession.group.id}/issues`,
      {
        method: 'GET',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );
    if (!response.ok) {
      showErrorToast(
        this.toaster,
        'Er is een fout opgetreden bij het ophalen van de validatieresultaten.',
        'Validatie rapport'
      );
      return;
    }
    this.latestValidationResults = await response.json();
  }

  async getResultsByInstance(instance) {
    const results = (await this.latestValidationResults) ?? [];
    return results.filter((result) => instance.uri === result.focusNode);
  }

  async getResultsByClass() {
    const results = (await this.latestValidationResults) ?? [];
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
              return this.processRawResult(result, key, instance);
            }
          })
        );
        const valuesWithAccessibleInstance = valuesWithInstance.filter(
          (result) => result
        );
        valuesWithAccessibleInstance.sort((a, b) => {
          const aValue = `${a.label}${a.message}${a.detail}`;
          const bValue = `${b.label}${b.message}${b.detail}`;
          if (aValue < bValue) {
            return -1;
          }
          if (aValue > bValue) {
            return 1;
          }
          return 0;
        });
        enrichedInstancesPerType.push({
          class: { uri: key, label: emberDataMapping.classLabel },
          instances: valuesWithAccessibleInstance,
        });
      })
    );
    enrichedInstancesPerType.sort((a, b) => {
      if (a.class.label < b.class.label) {
        return -1;
      }
      if (a.class.label > b.class.label) {
        return 1;
      }
      return 0;
    });
    return enrichedInstancesPerType;
  }

  async processRawResult(rawResult, classUri, instance) {
    const value = rawResult.value?.trim();
    if (
      rawResult.sourceConstraintComponent ===
      'http://www.w3.org/ns/shacl#DatatypeConstraintComponent'
    ) {
      let dataType = null;
      try {
        dataType = rawResult.resultMessage.split('<')[1].split('>')[0];
      } catch (e) {
        console.log('unrecognized data type', rawResult.resultMessage);
      }
      return {
        result: rawResult,
        message: 'Verkeerd datatype',
        detail: `Verwacht datatype voor ${rawResult.resultPath}: ${dataType}, maar waarde was ${value}`,
        instance,
        label: instance.validationText
          ? await instance.validationText
          : rawResult.focusNode,
        context: await this.getContext(classUri, instance),
      };
    }
    if (
      rawResult.sourceConstraintComponent ===
      'http://www.w3.org/ns/shacl#MinCountConstraintComponent'
    ) {
      let minCount = null;
      try {
        minCount = rawResult.resultMessage.replace(/\D*/g, '');
      } catch (e) {
        console.log('unrecognized min count', rawResult.resultMessage);
      }
      return {
        result: rawResult,
        message: 'Niet voldoende waarden ingevuld',
        detail: minCount
          ? `Minimaal ${minCount} waarde${minCount === '1' ? '' : 'n'} vereist voor ${rawResult.resultPath}`
          : '',
        instance,
        label: instance.validationText
          ? await instance.validationText
          : rawResult.focusNode,
        context: await this.getContext(classUri, instance),
      };
    }
    if (
      rawResult.sourceConstraintComponent ===
      'http://www.w3.org/ns/shacl#MaxCountConstraintComponent'
    ) {
      let maxCount = null;
      try {
        maxCount = rawResult.resultMessage.replace(/\D*/g, '');
      } catch (e) {
        console.log('unrecognized max count', rawResult.resultMessage);
      }
      return {
        result: rawResult,
        message: 'Te veel waarden ingevuld',
        detail: maxCount
          ? `Maximaal ${maxCount} waarde${maxCount === '1' ? '' : 'n'} vereist voor ${rawResult.resultPath}`
          : '',
        instance,
        label: instance.validationText
          ? await instance.validationText
          : rawResult.focusNode,
        context: await this.getContext(classUri, instance),
      };
    }
    return {
      result: rawResult,
      message: rawResult.resultMessage,
      detail: value,
      instance,
      label: instance.validationText
        ? await instance.validationText
        : rawResult.focusNode,
      context: await this.getContext(classUri, instance),
    };
  }

  async getResultsOrderedByClassAndInstance() {
    const grouped = await this.getResultsByClass();
    const flattened = [];
    for (const group of grouped) {
      for (const instance of group.instances) {
        flattened.push({ group, instance });
      }
    }
    return flattened;
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

  async getCurrentReportStatus() {
    return (
      await this.store.query('report-status', {
        sort: '-started-at',
        page: {
          size: 1,
        },
      })
    )[0];
  }

  async getIssuesForInstance(instance) {
    const results = await this.latestValidationResults;
    if (!results) {
      return false;
    }
    const issues = await Promise.all(
      results
        .filter((result) => result.focusNodeId === instance.id)
        .map((result) =>
          this.processRawResult(result, result.targetClassOfFocusNode, instance)
        )
    );
    return issues;
  }

  get isRunning() {
    return this.warmingUp || this.runningStatus;
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
        if (this.router.currentRouteName !== 'report') {
          showSuccessToast(this.toaster, 'Rapport gereed', 'Validatie rapport');
        }
        this.canShowReportIsGenerated = false;
      }
    } else {
      const timeSinceStart =
        new Date().getTime() - this.startedPolling.getTime();
      setTimeout(
        () => {
          this.keepPolling.perform();
        },
        timeSinceStart > 10000 ? 10000 : 1000
      );
    }
    await this.setRunningStatus();
  });

  polling = task({ drop: true }, async () => {
    this.canShowReportIsGenerated = true;
    this.startedPolling = new Date();
    await this.setRunningStatus();
    this.keepPolling.perform();
    this.warmingUp = false;
  });

  generateReport = task({ drop: true }, async (bestuurseenheid) => {
    this.warmingUp = true;
    const currentStatus = await this.getCurrentReportStatus();
    const response = await fetch(`/validation-report-api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        bestuurseenheidUri: bestuurseenheid.uri,
      }),
    });
    if (!response.ok) {
      showErrorToast(
        this.toaster,
        'Er is een fout opgetreden bij het genereren van het rapport.',
        'Validatie rapport'
      );
      return;
    }
    let trackingNewReport = false;
    while (!trackingNewReport) {
      await timeout(1000);
      const newReportStatus = await this.getCurrentReportStatus();
      trackingNewReport =
        newReportStatus && newReportStatus.id !== currentStatus?.id;
    }
    this.polling.perform();
    if (this.runningStatus && this.router.currentRouteName !== 'report') {
      showSuccessToast(
        this.toaster,
        'Rapport wordt gegenereerd. Dit kan mogelijks een tijdje duren.',
        'Validatie rapport'
      );
      return;
    }
  });

  get lastValidationDuration() {
    const lastStatus = this.lastRunnningStatus;
    if (!lastStatus) {
      return null;
    }
    if (!lastStatus.startedAt || !lastStatus.finishedAt) {
      return null;
    }
    const startedAt = moment(lastStatus.startedAt);
    const finishedAt = moment(lastStatus.finishedAt);
    const duration = moment.duration(finishedAt.diff(startedAt));
    const minutes = Math.floor(duration.asMinutes());
    const textForMinutes = `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} en`;
    const seconds = duration.seconds();

    return `${minutes !== 0 ? textForMinutes : ''} ${seconds} seconde${seconds === 1 ? '' : 'n'}.`;
  }
}
