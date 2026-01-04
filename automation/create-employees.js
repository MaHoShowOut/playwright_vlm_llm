const { chromium } = require('playwright');

const employees = [
  {
    name: '张三',
    salary: '75000',
    duration: '24',
    level: 'Senior',
    email: 'zhang.san@company.com'
  },
  {
    name: '李四',
    salary: '90000',
    duration: '36',
    level: 'Middle',
    email: 'li.si@company.com'
  },
  {
    name: '王五',
    salary: '65000',
    duration: '18',
    level: 'Junior',
    email: 'wang.wu@company.com'
  }
];

async function createEmployees() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  try {
    // Login
    console.log('Logging in...');
    await page.goto('http://localhost:3000');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✓ Login successful\n');

    // Create each employee
    for (const employee of employees) {
      console.log(`Creating employee: ${employee.name}...`);

      try {
        // Navigate to create employee page
        await page.click('text=Add Employee');
        await page.waitForLoadState('networkidle');

        // Fill form
        await page.fill('input[name="name"]', employee.name);
        await page.fill('input[name="salary"]', employee.salary);
        await page.fill('input[name="duration"]', employee.duration);
        await page.selectOption('select[name="level"]', employee.level);
        await page.fill('input[name="email"]', employee.email);

        // Submit
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // Verify success
        const successMessage = await page.locator('text=Success').isVisible();

        results.push({
          name: employee.name,
          status: successMessage ? 'Success' : 'Failed',
          details: employee
        });

        console.log(`✓ ${employee.name} created successfully\n`);
      } catch (error) {
        results.push({
          name: employee.name,
          status: 'Failed',
          error: error.message,
          details: employee
        });
        console.log(`✗ Failed to create ${employee.name}: ${error.message}\n`);
      }
    }

    // Generate report
    console.log('\n=== CREATION REPORT ===');
    console.log(`Total employees: ${employees.length}`);
    console.log(`Successful: ${results.filter(r => r.status === 'Success').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'Failed').length}`);
    console.log('\nDetails:');
    results.forEach(r => {
      console.log(`- ${r.name}: ${r.status}`);
      if (r.error) console.log(`  Error: ${r.error}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

createEmployees();
