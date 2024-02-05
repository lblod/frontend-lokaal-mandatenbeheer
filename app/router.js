import EmberRouter from '@ember/routing/router';
import config from 'frontend-lmb/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('switch-login');
  this.route('mock-login');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route('contact');

  this.route('legaal', function () {
    this.route('disclaimer');
    this.route('cookieverklaring');
    this.route('toegankelijkheidsverklaring');
  });

  this.route('mandatenbeheer', function () {
    this.route('mandatarissen', function () {
      this.route('new');
      this.route('new-person');
      this.route('edit', { path: '/:id/edit' });
    });

    this.route('fracties', function () {
      this.route('new');
      this.route('edit', { path: '/:id/edit' });
    });
  });

  this.route('leidinggevendenbeheer', function () {
    this.route(
      'bestuursfunctie',
      { path: '/:bestuursfunctie_id' },
      function () {
        this.route('contact-info');
        this.route('functionarissen', function () {
          this.route('edit', { path: '/:functionaris_id/edit' });
          this.route('new-person');
          this.route('new', function () {
            this.route('periode', { path: '/:persoon_id/periode' });
          });
        });
      }
    );
  });

  this.route('legacy', function () {
    this.route('mandatenbeheer', function () {
      this.route('mandatarissen', function () {
        this.route('new');
        this.route('new-person');
        this.route('edit', { path: '/:id/edit' });
      });

      this.route('fracties', function () {});
      this.route('fracties-new', function () {
        this.route('new');
        this.route('instances');
        this.route('instance', { path: '/:instance_id' });
        this.route('edit');
      });
    });

    this.route('leidinggevendenbeheer', function () {
      this.route('bestuursfuncties', function () {
        this.route(
          'bestuursfunctie',
          { path: '/:bestuursfunctie_id' },
          function () {
            this.route('contact-info');
            this.route('functionarissen', function () {
              this.route('edit', { path: '/:functionaris_id/edit' });
              this.route('new-person');
              this.route('new', function () {
                this.route('periode', { path: '/:persoon_id/periode' });
              });
            });
          }
        );
      });
    });

    this.route('formbeheer', function () {
      this.route('form', { path: '/:id' }, function () {
        this.route('new');
        this.route('instances');
        this.route('instance', { path: '/instance/:instance_id' });
        this.route('edit');
      });
    });
  });

  this.route('error/404', {
    path: '/*wildcard',
  });
});
