This folder contains a set of automated end to end tests for the /rekenhof route.
The tests are written using the Playwright testing framework.

*EXECUTING THE TESTS*

Running npm install will install the @playwright/test package

You can run the tests with the following command:
npx playwright test --ui  (this can be run in the root folder of the application)


In the folder /playwright-report, automatically generated files related to the ui will be created, so make sure this is in the .gitignore




*INFORMATION ABOUT THE TESTS*

The tests include a reusable login function that allows you to specify the location parameter,representing the municipality or entity being tested.
To test different locations, modify the location parameter in the test files as needed.
This function assumes the /mock-login route is being used for login so will require some changes to run in a production environment.


