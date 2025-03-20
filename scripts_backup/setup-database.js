const { exec } = require('child_process');
const path = require('path');

console.log('Setting up the database...');

// Run the first script to create HS code tables
exec(`node ${path.join(__dirname, 'create-database.js')}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing create-database.js: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  
  // Run the second script to add country trade data
  exec(`node ${path.join(__dirname, 'create-country-trade-data.js')}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing create-country-trade-data.js: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    
    console.log(stdout);
    console.log('Database setup completed successfully!');
  });
}); 