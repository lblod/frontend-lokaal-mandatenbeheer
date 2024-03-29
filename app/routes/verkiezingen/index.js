import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VerkiezingenIndexRoute extends Route {
  @service currentSession;
  @service store;

  async getInstallatievergaderingenOfBestuurseenheid(bestuurseenheidId) {
    return await this.store.query('installatievergadering', {
      'filter[bestuursorgaan-in-tijd][is-tijdsspecialisatie-van][bestuurseenheid][id]':
        bestuurseenheidId,
      include: [
        'status',
        'bestuursorgaan-in-tijd',
        'bestuursorgaan-in-tijd.is-tijdsspecialisatie-van',
      ].join(','),
    });
  }

  groupByYearAndStatus(installatievergaderingen) {
    const yearToStatusIdToIvs = {};
    const statusIdToStatus = {};

    installatievergaderingen.forEach((vergadering) => {
      const year = vergadering
        .get('bestuursorgaanInTijd.bindingStart')
        .getFullYear();
      const status = vergadering.get('status');
      const statusId = status.id;
      if (!yearToStatusIdToIvs[year]) {
        yearToStatusIdToIvs[year] = {};
      }
      if (!yearToStatusIdToIvs[year][statusId]) {
        yearToStatusIdToIvs[year][statusId] = [];
      }
      yearToStatusIdToIvs[year][statusId].push(vergadering);

      statusIdToStatus[statusId] = status;
    });

    return { yearToStatusIdToIvs, statusIdToStatus };
  }

  // This format is easier to work with in the template
  /*
  [
    {
      year: 2019,
      statusesWithIvs: [
        {
          status: status1,
          installatievergaderingen: [installatievergadering1, installatievergadering2]
        },
        {
          status: status2,
          installatievergaderingen: [installatievergadering3]
        }
      ]
    }
  ]
  */
  formatIvsMapToLists(yearToStatusIdToIvs, statusIdToStatus) {
    return Object.keys(yearToStatusIdToIvs).map((year) => {
      const statusIdToInstallatievergaderingen = yearToStatusIdToIvs[year];
      return {
        year,
        statusesWithIvs: Object.keys(statusIdToInstallatievergaderingen).map(
          (statusId) => {
            return {
              status: statusIdToStatus[statusId],
              installatievergaderingen:
                statusIdToInstallatievergaderingen[statusId],
            };
          }
        ),
      };
    });
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;

    const installatievergaderingen =
      await this.getInstallatievergaderingenOfBestuurseenheid(
        bestuurseenheid.get('id')
      );

    const { yearToStatusIdToIvs, statusIdToStatus } = this.groupByYearAndStatus(
      installatievergaderingen
    );

    const yearsAndStatusesWithIvs = this.formatIvsMapToLists(
      yearToStatusIdToIvs,
      statusIdToStatus
    );

    yearsAndStatusesWithIvs.sort((a, b) => {
      if (b.year < a.year) {
        return -1;
      }
      return 1;
    });

    return {
      installatievergaderingen,
      yearsAndStatusesWithIvs,
    };
  }
}
