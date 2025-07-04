# frontend-lokaal-mandatenbeheer

Frontend of the lokaal mandatenbeheer application

## Tutorial

1. Make sure that the backend server is running. If this is not the case yet, first follow the instructions at: <https://github.com/lblod/app-lokaal-mandatenbeheer>

2. [Install docker-ember](https://github.com/madnificent/docker-ember)

3. Run the command

   ```
   ed npm install
   ```

   in your terminal. This will install all current node modules.

4. Run the command

   ```
   eds --proxy http://host:90
   ```

   in your terminal. This will launch the Ember server and proxy to your localhost on port 90.

5. Browse to: <http://localhost:4200>. This is the view that the unauthenticated users will see. For the view of authenticated users, browse to: <http://localhost:4200/mock-login>.

## Feature flags

Feature flags are used to enable/disable features in the application. They are defined in [config/environment.js](config/environment.js).

```javascript
// in config/environment.js
let ENV = {
  // Other configuration settings...
  features: {
    "new-feature": true, // Enable the 'new-feature' by default
    "beta-feature": false, // Disable the 'beta-feature' by default
  },
};
```

The configuration can be manually overridden by adding a query parameter to the URL:

`?feature-new-feature=false` to disable the 'new-feature'
`?feature-beta-feature=true` to enable the 'beta-feature'
The overriding will be saved in a cookie, so it will persist across page reloads. The cookie can be cleared by adding `?clear-feature-overrides=true` to the URL.

The feature flags can be used in the application by injecting the `features` service and calling the `isEnabled` method.

```javascript
import { service } from "@ember/service";

export default class ExampleComponent extends Component {
  @service features;

  doSomething() {
    if (this.features.isEnabled("new-feature")) {
      // Implement the logic for the new feature
      console.log("New feature is enabled!");
    } else {
      // Implement the logic for the default behaviour without the new feature
      console.log("New feature is disabled!");
    }
  }
}
```

Or in template files by using the `is-feature-enabled` helper:

```handlebars
{{#if (is-feature-enabled "new-feature")}}
  <p>New feature is enabled!</p>
{{else}}
  <p>New feature is disabled!</p>
{{/if}}
```

### List of feature flags

| Name                     | Description                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `custom-organen`         | Make the use of custom organen possible.                                                                |
| `politieraad`            | Politieraad orgaan code will be added to the organen list (decretaleIds).                               |
| `editable-forms`         | Creating/extending forms with the possibility for updating the form definition.                         |
| `edit-mandataris-rework` | Use the mandataris wizard instead of the update/correct mandataris form.                                |
| `shacl-report`           | Enable showing validation errors throught the app. Origin of the errors is the shacl validaiton report. |

## Environment variables

This frontend is hosted by the [static-file-service](https://github.com/mu-semtech/static-file-service) microservice. It supports configuring our Ember application at runtime using environment variables. The following options are available for the lokaal mandatenbeheer image.

### General

> TODO This functionality is not supported yet.

| Name             | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `EMBER_LPDC_URL` | Link to the LPDC application (only required when the feature flag is enabled) |

### ACM/IDM

> TODO This functionality is not supported yet. It will be added in the near future.

| Name                               | Description                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EMBER_ACMIDM_CLIENT_ID`           | The unique client id for a specific environment                                                                                                          |
| `EMBER_ACMIDM_AUTH_URL`            | The URL where users will be redirected to when they want to log in                                                                                       |
| `EMBER_ACMIDM_AUTH_REDIRECT_URL`   | The callback URL that ACM/IDM will use after the user logs in successfully                                                                               |
| `EMBER_ACMIDM_LOGOUT_URL`          | The URL where users will be redirected to when they want to log out                                                                                      |
| `EMBER_ACMIDM_SWITCH_REDIRECT_URL` | The URL that will be used when "switching users" is enabled in ACM/IDM. After logout, users can select one of their other accounts to simplify the flow. |

> When ACM/IDM is not configured, the frontend will default to the "mock login" setup instead.

### Plausible

> TODO This functionality is not supported yet.

| Name                         | Description                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `EMBER_ANALYTICS_API_HOST`   | The URL of the Plausible host to which all events will be sent                   |
| `EMBER_ANALYTICS_APP_DOMAIN` | The app domain which will be used to group the events in the Plausible dashboard |

> Analytics will only be enabled when both variables are configured.

### Sentry

> TODO This functionality is not supported yet.

| Name                       | Description                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `EMBER_SENTRY_DSN`         | Sentry DSN. Setting this activates the sentry integration.                                      |
| `EMBER_SENTRY_ENVIRONMENT` | The name of the environment under which the errors should be reported. Defaults to 'production' |
