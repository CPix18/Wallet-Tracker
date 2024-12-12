import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token address to name mapping
const addressToName = {
    '0x9560e827af36c94d2ac33a39bce1fe78631088db': 'VELO',
    '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d': 'MIGGLES',
    '0xae78736Cd615f374D3085123A210448E74Fc6393': 'rETH',
    '0x940181a94A35A4569E4529A3CDfB74e38FD98631': 'AERO',
    '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9': 'BSWAP',
    '0x4200000000000000000000000000000000000042': 'OP',
    '0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE': 'TYBG',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
    '0xD101dCC414F310268c37eEb4cD376CcFA507F571': 'RSC',
    '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed': 'DEGEN',
    '0xD33526068D116cE69F19A9ee46F0bd304F21A51f': 'RPL',
    '0xc944E90C64B2c07662A292be6244BDf05Cda44a7': 'GRT',
    '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E': 'ILV',
    '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198': 'BANK',
    '0x5aFE3855358E112B5647B952709E6165e1c1eEEe': 'SAFE',
    '0x1121AcC14c63f3C872BFcA497d10926A6098AAc5': 'DOGE-E',
    '0xA202B2b7B4D2fe56BF81492FFDDA657FE512De07': 'BABYMIGGLES',
    '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b': 'VIRTUALS',
    '0xbC1852F8940991d91BD2b09A5aBb5E7B8092a16C': 'BASEPRINTER',
    '0x08bEa95Ec37829CBBdA9B556F340464d38546160': 'BABYDEGEN',
};

// Enhanced Function to fetch token prices from the Alchemy API by symbols
const fetchTokenPricesBySymbol = async () => {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json' }
    };

    try {
        const response = await fetch('https://api.g.alchemy.com/prices/v1/JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x/tokens/by-symbol?symbols=ETH&symbols=SOL&symbols=TIA&symbols=DOGE&symbols=LUNA', options);
        const data = await response.json();

        console.log('Fetched Token Prices:', JSON.stringify(data, null, 2));

        const tokensData = data.data || [];
        return tokensData.map(token => ({
            symbol: token.symbol,
            name: token.symbol, // Use symbol as name if no specific name field exists
            price: token.prices?.[0]?.value || 'N/A'
        }));
    } catch (err) {
        console.error('Error fetching token prices by symbol:', err);
        return [];
    }
};

// Function to fetch additional token data by address and save to CSV
const fetchAdditionalTokenDataByAddress = async () => {
    const options = {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
            addresses: [
                { network: 'eth-mainnet', address: '0xae78736Cd615f374D3085123A210448E74Fc6393' },
                { network: 'eth-mainnet', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
                { network: 'eth-mainnet', address: '0xD101dCC414F310268c37eEb4cD376CcFA507F571' },
                { network: 'eth-mainnet', address: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f' },
                { network: 'eth-mainnet', address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7' },
                { network: 'eth-mainnet', address: '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E' },
                { network: 'eth-mainnet', address: '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198' },
                { network: 'eth-mainnet', address: '0x5aFE3855358E112B5647B952709E6165e1c1eEEe' },
                { network: 'eth-mainnet', address: '0x1121AcC14c63f3C872BFcA497d10926A6098AAc5' },
                { network: 'base-mainnet', address: '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d' },
                { network: 'base-mainnet', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' },
                { network: 'base-mainnet', address: '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9' },
                { network: 'base-mainnet', address: '0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE' },
                { network: 'base-mainnet', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' },
                { network: 'base-mainnet', address: '0xA202B2b7B4D2fe56BF81492FFDDA657FE512De07' },
                { network: 'base-mainnet', address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b' },
                { network: 'base-mainnet', address: '0xbC1852F8940991d91BD2b09A5aBb5E7B8092a16C' },
                { network: 'base-mainnet', address: '0x08bEa95Ec37829CBBdA9B556F340464d38546160' },
                { network: 'opt-mainnet', address: '0x4200000000000000000000000000000000000042' },
                { network: 'opt-mainnet', address: '0x9560e827af36c94d2ac33a39bce1fe78631088db' },
            ]
        })
    };

    try {
        const response = await fetch('https://api.g.alchemy.com/prices/v1/JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x/tokens/by-address', options);
        const res = await response.json();

        const tokensData = res.data || [];
        const csvRows = [];

        tokensData.forEach(token => {
            const address = token.address;
            const name = addressToName[address] || address;
            const price = token.prices?.[0]?.value || 'N/A';
            csvRows.push([name, price]);
        });

        return csvRows;
    } catch (err) {
        console.error('Error fetching additional token data by address:', err);
        return [];
    }
};

// Main Function to Fetch Prices and Save to CSV
const main = async () => {
    // Fetch token prices by symbol
    const tokenPrices = await fetchTokenPricesBySymbol();

    // Fetch additional token data by address
    const additionalTokenData = await fetchAdditionalTokenDataByAddress();

    // Combine the data from both API calls
    const combinedCsvRows = [
        ["Token Name", "Price (USD)"],
        ...tokenPrices.map(token => [token.name, token.price]),
        ...additionalTokenData
    ];

    const filePath = path.join(__dirname, 'token_prices.csv');
    const csvString = combinedCsvRows.map(row => row.join(',')).join('\n');
    fs.writeFileSync(filePath, csvString);

    console.log(`CSV file has been saved to: ${filePath}`);
};

// Execute the main function
main();
