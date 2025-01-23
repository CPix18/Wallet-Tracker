import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createObjectCsvWriter } from 'csv-writer';
import fetch from 'node-fetch'; // Install this with `npm install node-fetch`

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dune API settings
const apiKey = '<api-key-here>';
const apiBaseUrl = 'https://api.dune.com/api/echo/beta/balances/svm';

// List of addresses to process
const addresses = [
    // Add address here
];

// Create a CSV writer instance
const csvWriter = createObjectCsvWriter({
    path: path.join(__dirname, 'solana_balances.csv'),
    header: [
        { id: 'address', title: 'Address' },
        { id: 'chain', title: 'Chain' },
        { id: 'symbol', title: 'Token Symbol' },
        { id: 'balance', title: 'Balance' },
        { id: 'value_usd', title: 'Value (USD)' }
    ]
});

const fetchBalances = async (address) => {
    const url = `${apiBaseUrl}/${address}`;
    const options = {
        method: 'GET',
        headers: {
            'X-Dune-Api-Key': apiKey
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Failed to fetch data for ${address}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

const main = async () => {
    const records = [];

    for (const address of addresses) {
        console.log(`Fetching balances for ${address}...`);
        const data = await fetchBalances(address);

        if (!data || !data.balances || data.balances.length === 0) {
            console.error(`No balances found for address ${address}.`);
            continue;
        }

        // Process all balances for the current address
        for (const balance of data.balances) {
            records.push({
                address: data.wallet_address,
                chain: balance.chain,
                symbol: balance.symbol || 'Unknown',
                balance: (balance.amount / Math.pow(10, balance.decimals)).toFixed(4), // Adjust decimals
                value_usd: balance.value_usd.toFixed(2)
            });
            console.log(
                `Balance for ${balance.symbol} on ${balance.chain}: ${balance.amount} (${balance.value_usd} USD)`
            );
        }
    }

    // Write the results to a CSV file
    if (records.length > 0) {
        await csvWriter.writeRecords(records);
        console.log('\nBalances have been written to solana_balances.csv');
    } else {
        console.log('No balances to write to CSV.');
    }
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain();
