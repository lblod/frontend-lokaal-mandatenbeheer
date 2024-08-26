const { test, expect } = require('@playwright/test');
const fs = require('fs');

// import { defineConfig } from '@playwright/test';
// export default defineConfig({
//   use: {
//     ignoreHTTPSErrors: true,
//   },
// });

test('test title on rekenhof route', async ({ browser }) => {
  // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  // Create a new page in the context
  const page = await context.newPage();

  // Navigate to the page
  await page.goto('/rekenhof');

  // Check the title of the page
  const title = await page.title();
  expect(title).toBe('Lokaal Mandatenbeheer');

  // Close the context
  await context.close();
});

test('test login', async ({ browser }) => {
  // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  // Create a new page in the context
  const page = await context.newPage();

  // Navigate to the login page
  await page.goto('/mock-login');

  // Click 'Gemeente Aalst' button
  await page.click('text=Gemeente Aalst');

  // Wait for the page to load
  await page.waitForNavigation();

  // Verify page contains text=Gemeente Aalst
  await page.waitForSelector('text=Gemeente Aalst');


  // Close the context
  await context.close();
}); 


test('test login and then browse to /rekenhof and test whether api call gets made', async ({ browser }) => {
  // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  // Create a new page in the context
  const page = await context.newPage();

  // Navigate to the login page
  await page.goto('/mock-login');

  // Click 'Gemeente Aalst' button
  await page.click('text=Gemeente Aalst');

  // Wait for the page to load
  await page.waitForNavigation();

  // Verify page contains text=Gemeente Aalst
  await page.waitForSelector('text=Gemeente Aalst');

  // Navigate to rekenhof route
  await page.goto('/rekenhof');

  // Wait for the page to reach the 'networkidle' state (should be after the get call to the API)
  await page.waitForLoadState('networkidle');


  // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
  const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
  await expect(tableText).toBeVisible();

  // Close the context
  await context.close();
});

test('test login as Aalst, browse to /rekenhof, confirm Christoph is found', async ({ browser }) => {
    // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
  
    // Create a new page in the context
    const page = await context.newPage();
  
    // Navigate to the login page
    await page.goto('/mock-login');
  
    // Click 'Gemeente Aalst' button
    await page.click('text=Gemeente Aalst');
  
    // Wait for the page to load
    await page.waitForNavigation();
  
    // Verify page contains text=Gemeente Aalst
    await page.waitForSelector('text=Gemeente Aalst');
  
    // Navigate to rekenhof route
    await page.goto('/rekenhof');
  
    // Wait for the page to reach the 'networkidle' state (should be after the get call to the API)
    await page.waitForLoadState('networkidle');
  
  
    // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
    const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
    await expect(tableText).toBeVisible();

    // Verify the first occurrence of text=Christoph inside a table
    const christophText = page.locator('table tbody tr td:has-text("Christoph")').first();
    await expect(christophText).toBeVisible();

  
    // Close the context
    await context.close();
  });

//test login as Aalst, browse to /rekenhof, fill in every select box under -Vork bruto jaarsalaris na aftrek sociale bijdragen- trying every option once except -Manuele ingave (afronden op het dichtste honderdduizendtal)-
test('test regular selects', async ({ browser }) => {
    // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
  
    // Create a new page in the context
    const page = await context.newPage();
  
    // Navigate to the login page
    await page.goto('/mock-login');
  
    // Click 'Gemeente Aalst' button
    await page.click('text=Gemeente Aalst');
  
    // Wait for the page to load
    await page.waitForNavigation();
  
    // Verify page contains text=Gemeente Aalst
    await page.waitForSelector('text=Gemeente Aalst');
  
    // Navigate to rekenhof route
    await page.goto('/rekenhof');
  
    // Wait for the page to reach the 'networkidle' state (should be after the get call to the API)
    await page.waitForLoadState('networkidle');
  
    // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
    const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
    await expect(tableText).toBeVisible();
  
    // For every dropdown, find the options and select a random option except the last
    const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger', { strict: false });
    await expect(dropdowns.first()).toBeVisible();
    for (const dropdown of await dropdowns.elementHandles()) {
      // Click the dropdown to show the options
      await dropdown.click();
  
      // Wait for the options to be visible
      const options = page.locator('ul.ember-power-select-options li');
      await options.first().waitFor();
  
      // Get the values of the options
      const optionValues = await options.allTextContents();

      // Log retrieved values (debugging)
      console.log(optionValues);
  
      // Select a random option except the last one
      const randomIndex = Math.floor(Math.random() * (optionValues.length - 1));
      const randomOption = options.nth(randomIndex);
  
      // Click the selected option
      await randomOption.click();
    }
  
    // Save a screenshot of the state of the page
    await page.screenshot({ path: 'rekenhof.png' });
  
    // Close the context
    await context.close();
  });
  





//test login as Aalst, browse to /rekenhof, fill in every select box under -Vork bruto jaarsalaris na aftrek sociale bijdragen- trying every option once except -Manuele ingave (afronden op het dichtste honderdduizendtal)-, then download the CSV and check if it is a valid CSV
test('regular selects, download', async ({ browser }) => {
    // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      acceptDownloads: true // Enable downloads in the context
    });
  
    // Create a new page in the context
    const page = await context.newPage();
  
    // Navigate to the login page
    await page.goto('/mock-login');
  
    // Click 'Gemeente Aalst' button
    await page.click('text=Gemeente Aalst');
  
    // Wait for the page to load
    await page.waitForNavigation();
  
    // Verify page contains text=Gemeente Aalst
    await page.waitForSelector('text=Gemeente Aalst');
  
    // Navigate to rekenhof route
    await page.goto('/rekenhof');
  
    // Wait for the page to reach the 'networkidle' state (should be after the get call to the API)
    await page.waitForLoadState('networkidle');
  
    // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
    const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
    await expect(tableText).toBeVisible();
  
    // For every dropdown, find the options and select a random option except the last
    const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger', { strict: false });
    await expect(dropdowns.first()).toBeVisible();
    for (const dropdown of await dropdowns.elementHandles()) {
      // Click the dropdown to show the options
      await dropdown.click();
  
      // Wait for the options to be visible
      const options = page.locator('ul.ember-power-select-options li');
      await options.first().waitFor();
  
      // Get the values of the options
      const optionValues = await options.allTextContents();
  
      // Log retrieved values (debugging)
      console.log(optionValues);
  
      // Select a random option except the last one
      const randomIndex = Math.floor(Math.random() * (optionValues.length - 1));
      const randomOption = options.nth(randomIndex);
  
      // Click the selected option
      await randomOption.click();
    }
  
    // Save a screenshot of the state of the page
    await page.screenshot({ path: 'rekenhof.png' });
  
    // Press the download button ('Exporteer naar CSV')
    const [download] = await Promise.all([
      page.waitForEvent('download'), // Wait for the download event
      page.click('text=Exporteer naar CSV') // Trigger the download
    ]);
  
    // Save the downloaded file
    const downloadPath = await download.path();
    fs.renameSync(downloadPath, 'rekenhof.csv');

    // Verify the downloaded file is a valid CSV
    const csvContent = fs.readFileSync('rekenhof.csv', 'utf8');
    const rows = csvContent.split('\n');
    expect(rows.length).toBeGreaterThan(0);

    // Verify the header row
    const header = rows[0].split(',');
    const expectedHeader = [
        'Voornaam', 'Achternaam', 'Geboortedatum', 'Geslacht', 'RRN', 
        'Bestuursorgaan', 'Status Label', 'Startdatum', 'Einddatum', 
        'Vork bruto jaarsalaris na aftrek sociale bijdragen'
    ];
    expect(header).toEqual(expectedHeader);

   // Verify the content rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const columns = row.split(',');

    // Ensure each row has the correct number of columns
    expect(columns.length).toBe(expectedHeader.length);

    // Additional checks can be added here for specific column values if needed
  }
});


// test 'Manuele ingave (afronden op het dichtste honderdduizendtal)' option
test('test manual input', async ({ browser }) => {
    // Create a new browser context and ignore HTTPS errors (to fix localhost SSL issue)
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
  
    // Create a new page in the context
    const page = await context.newPage();
  
    // Navigate to the login page
    await page.goto('/mock-login');
  
    // Click 'Gemeente Aalst' button
    await page.click('text=Gemeente Aalst');
  
    // Wait for the page to load
    await page.waitForNavigation();
  
    // Verify page contains text=Gemeente Aalst
    await page.waitForSelector('text=Gemeente Aalst');
  
    // Navigate to rekenhof route
    await page.goto('/rekenhof');
  
    // Wait for the page to reach the 'networkidle' state (should be after the get call to the API)
    await page.waitForLoadState('networkidle');
  
    // Verify page contains text=Gevonden mandaten binnen uw Bestuurseenheid
    const tableText = page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid');
    await expect(tableText).toBeVisible();
  
     // Find all dropdowns
    const dropdowns = page.locator('.ember-view.ember-basic-dropdown-trigger');
    
    // Iterate over each dropdown
    for (const dropdown of await dropdowns.elementHandles()) {
      // Click the dropdown to show the options
      await dropdown.click();
    
      // Wait for the options to be visible
      const options = page.locator('ul.ember-power-select-options li');
      await options.first().waitFor();
    
      // Get the values of the options
      const optionValues = await options.allTextContents();
    
      // Log retrieved values (debugging)
      console.log(optionValues);
    
      // Select the last option (Manuele ingave (afronden op het dichtste honderdduizendtal))
      const manualOption = options.last();
      await manualOption.click();
    
        // Wait for the manual input fields to be visible
        const manualInputs = page.locator('input[type="number"]');
        await manualInputs.first().waitFor();

        // Fill in each manual input field with a random value
        for (const input of await manualInputs.elementHandles()) {
            const randomValue = Math.floor(Math.random() * 1000000);
            await input.fill(String(randomValue));
        }
    }

    // Save a screenshot of the state of the page
    await page.screenshot({ path: 'rekenhof-manual.png' });

    // Close the context
    await context.close();
    });


    // tests that the table does not show when logged out, even if it was loaded before
    test('test logout and table visibility', async ({ browser }) => {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();
    
      // Log in
      await page.goto('/mock-login');
      await page.click('text=Gemeente Aalst');
      await page.waitForNavigation();
    
      // Navigate to rekenhof route
      await page.goto('/rekenhof');
      await page.waitForLoadState('networkidle');
    
      // Verify the table is visible
      await expect(page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid')).toBeVisible();
    
      // Simulate logout by clearing session storage or cookies
      await context.clearCookies();
      await context.clearPermissions();
      await page.goto('/rekenhof');
    
      // Verify the table is not visible anymore
      await expect(page.locator('text=Gevonden mandaten binnen uw Bestuurseenheid')).not.toBeVisible();
    
      await context.close();
    });
    