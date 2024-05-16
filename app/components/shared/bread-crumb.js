import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  verkiezingen = [
    {
      route: 'verkiezingen.installatievergadering',
      crumbs: [
        {
          label: 'Verkiezingen',
        },
        { label: 'Voorbereiding legislatuur' },
      ],
    },
    {
      route: 'verkiezingen.verkiezingsuitslag',
      crumbs: [
        {
          label: 'Verkiezingen',
          link: 'verkiezingen.installatievergadering',
        },
        { label: 'Verkiezingsuitslag' },
      ],
    },
  ];

  bread = this.verkiezingen;

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName
    );
    if (results.length <= 0) {
      return [];
    }
    return results[0].crumbs;
  }
}
