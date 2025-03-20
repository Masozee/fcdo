import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.join(__dirname, '..');
const db = new Database(path.join(rootDir, 'data', 'trade_data.sqlite'));

try {
  // Get counts from each table
  const hsCodes = db.prepare('SELECT COUNT(*) as count FROM hs_codes').get();
  const tradeFlows = db.prepare('SELECT COUNT(*) as count FROM trade_flows').get();
  const trades = db.prepare('SELECT COUNT(*) as count FROM trade').get();
  
  console.log('Data counts:');
  console.log('HS Codes:', hsCodes.count);
  console.log('Trade Flows:', tradeFlows.count);
  console.log('Trade records:', trades.count);
  
  // Get sample data from each table
  console.log('\nSample HS Codes:');
  const sampleHsCodes = db.prepare('SELECT * FROM hs_codes LIMIT 5').all();
  console.log(sampleHsCodes);
  
  console.log('\nSample Trade Flows:');
  const sampleTradeFlows = db.prepare('SELECT * FROM trade_flows').all();
  console.log(sampleTradeFlows);
  
  console.log('\nSample Trade Records:');
  const sampleTrades = db.prepare('SELECT * FROM trade LIMIT 5').all();
  console.log(sampleTrades);
  
  // Get some aggregated trade data
  console.log('\nTop 5 countries by trade value:');
  const topCountries = db.prepare(`
    SELECT 
      country,
      COUNT(*) as record_count,
      SUM(value) as total_value,
      AVG(percent_trade) as avg_percent_trade
    FROM trade
    GROUP BY country
    ORDER BY total_value DESC
    LIMIT 5
  `).all();
  console.log(topCountries);
  
  // Get trade flow distribution
  console.log('\nTrade flow distribution:');
  const tradeFlowDistribution = db.prepare(`
    SELECT 
      tf.name as trade_flow,
      COUNT(*) as record_count,
      SUM(t.value) as total_value
    FROM trade t
    JOIN trade_flows tf ON t.trade_flow_id = tf.id
    GROUP BY tf.id, tf.name
  `).all();
  console.log(tradeFlowDistribution);
  
  // Get year range
  console.log('\nYear range:');
  const yearRange = db.prepare(`
    SELECT 
      MIN(year) as min_year,
      MAX(year) as max_year,
      COUNT(DISTINCT year) as year_count
    FROM trade
  `).get();
  console.log(yearRange);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
} 