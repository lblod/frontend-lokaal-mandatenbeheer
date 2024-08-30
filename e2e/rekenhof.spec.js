const { test, expect } = require('@playwright/test');
const fs = require('fs');

// Function to handle login
async function login(page, location) {
  // Navigate to the login page
  await page.goto('/mock-login');

  // Click the button with the specified location
  await page.click(`text=${location}`);

  // Wait for the page to load
  await page.waitForNavigation();

  // Verify the page contains the specified location text
  await page.waitForSelector(`text=${location}`);
}

test('test title on rekenhof route', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Check the title of the page
  const title = await page.title();
  expect(title).toBe('Lokaal Mandatenbeheer');

  await context.close();
});

test('test login', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  await context.close();
});

test('test login and then browse to /rekenhof and test whether api call gets made', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state
  await page.waitForLoadState('networkidle');

  // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  await context.close();
});

test('test login as Aalst, browse to /rekenhof, confirm Christoph is found', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state
  await page.waitForLoadState('networkidle');

  // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  // Verify the first occurrence of text=Christoph inside a table
  const christophText = page.locator('table tbody tr td:has-text("Christoph")').first();
  await expect(christophText).toBeVisible();

  await context.close();
});

test('test regular selects', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state
  await page.waitForLoadState('networkidle');

  // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  // For every dropdown, find the options and select a random option except the last
  const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger', { strict: false });
  await expect(dropdowns.first()).toBeVisible();
  for (const dropdown of await dropdowns.elementHandles()) {
    await dropdown.click();
    const options = page.locator('ul.ember-power-select-options li');
    await options.first().waitFor();
    const optionValues = await options.allTextContents();
    console.log(optionValues);
    const randomIndex = Math.floor(Math.random() * (optionValues.length - 1));
    const randomOption = options.nth(randomIndex);
    await randomOption.click();
  }

  await page.screenshot({ path: 'rekenhof.png' });
  await context.close();
});

test('regular selects, download', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    acceptDownloads: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state
  await page.waitForLoadState('networkidle');

  // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger', { strict: false });
  await expect(dropdowns.first()).toBeVisible();
  for (const dropdown of await dropdowns.elementHandles()) {
    await dropdown.click();
    const options = page.locator('ul.ember-power-select-options li');
    await options.first().waitFor();
    const optionValues = await options.allTextContents();
    console.log(optionValues);
    const randomIndex = Math.floor(Math.random() * (optionValues.length - 1));
    const randomOption = options.nth(randomIndex);
    await randomOption.click();
  }

  await page.screenshot({ path: 'rekenhof.png' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Exporteer naar CSV')
  ]);

  const downloadPath = await download.path();
  fs.renameSync(downloadPath, 'rekenhof.csv');

  const csvContent = fs.readFileSync('rekenhof.csv', 'utf8');
  const rows = csvContent.split('\n');
  expect(rows.length).toBeGreaterThan(0);

  const header = rows[0].split(',');
  const expectedHeader = [
    'Voornaam', 'Achternaam', 'Geboortedatum', 'Geslacht', 'RRN', 
    'Bestuursorgaan', 'Status Label', 'Rol', 'Startdatum', 'Einddatum', 
    'Vork bruto jaarsalaris na aftrek sociale bijdragen'
  ];
  expect(header).toEqual(expectedHeader);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const columns = row.split(',');
    expect(columns.length).toBe(expectedHeader.length);
  }
});

test('test manual input', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state
  await page.waitForLoadState('networkidle');

  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger');
  for (const dropdown of await dropdowns.elementHandles()) {
    await dropdown.click();
    const options = page.locator('ul.ember-power-select-options li');
    await options.first().waitFor();
    const optionValues = await options.allTextContents();
    console.log(optionValues);
    const manualOption = options.last();
    await manualOption.click();

    const manualInputs = page.locator('input[type="number"]');
    await manualInputs.first().waitFor();
    for (const input of await manualInputs.elementHandles()) {
      const randomValue = Math.floor(Math.random() * 1000000);
      await input.fill(String(randomValue));
    }
  }

  await page.screenshot({ path: 'rekenhof-manual.png' });
  await context.close();
});

test('test logout and table visibility', async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Perform login
  await login(page, 'Gemeente Aalst');

  await page.goto('/rekenhof');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid')).toBeVisible();

  await context.clearCookies();
  await context.clearPermissions();
  await page.goto('/rekenhof');

  await expect(page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid')).not.toBeVisible();
  await context.close();
});
