import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Alchemy, Utils } from 'alchemy-sdk';
import { createObjectCsvWriter } from 'csv-writer';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = "JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x";
const settings = {
    apiKey: apiKey
};

const alchemy = new Alchemy(settings);

// Set wallet addresses
const addresses = [
    "0x7Ad731E8b0263896eD5d0DD679128719a306CdEE",
    "0xabc45198100a01e9e07ac2a304f5d002d3005018",
    "0x0455aeb2A8f6E033a4906671102c0B992e4af8C1",
    "0xdFFDF2728d50b777648B9B8DA61eDB9318Bd60cE",
    "0x1531be9d6f3d6B001B9Ec9b35eD5466f66cf9E06",
    "0x7110D94153cCBf0a6F9D11527648549516b4C809",
    "0x9BDCf7dA2119dfe974967A848C7a49C9376b1b44",
    "0x8aA5772dc03aE73D01b7d6f11362d8E1345ccF06",
    "0xdc453E01c0E2E0E5d36545E70ff38342ed65ab0d",
    "0x3ac289e029bc05374d880244fc7aff966f000b34",
    "0x2d7Bb1313bd2EA36dE9358241fFd674e3bED5a4F",
    "0xd6fF60a24bb0917BC3D6D76A0E551d591D9bd5Ac",
    "0xeE00CFF9656F2f432FEb768803F8233dCcbD7bd5",
    "0x062780A9275e18D1Df979e38E0767774D01A10C0",
    "0x1dbB95e4f2c7Ad1d7CaA36CD60f468C559158811",
    "0x2c5d7559cAbf3c9Ee67c92899f7e3bB58E99Aa01",
    "0x46db2fbfe2bbe35b66c70cc9e1dc61f82a6a8ff5",
    "0x3442BFf38Da294EC9cfa7ecD29581cb048aE9107",
    "0xeca0B6454eFf51b7b6092cB85C7F6848b262BA19"
];

// Create a CSV writer instance
const csvWriter = createObjectCsvWriter({
    path: path.join(__dirname, 'ethBalances.csv'),
    header: [
        { id: 'address', title: 'Address' },
        { id: 'balance', title: 'Balance (ETH)' }
    ]
});

const main = async () => {
    const records = [];
    let totalBalance = 0;  // Initialize the total balance accumulator

    // Loop through the addresses to get their balance
    for (const address of addresses) {
        let balance = await alchemy.core.getBalance(address, 'latest');
        balance = Utils.formatEther(balance);

        // Convert the balance to a float and add it to the total balance
        totalBalance += parseFloat(balance);

        // Push the address and balance to the records array
        records.push({ address: address, balance: balance });

        console.log(`Balance of ${address}: ${balance} ETH`);
    }

    // Append the total balance to the records array
    records.push({ address: 'Total', balance: totalBalance.toFixed(4) });  // Add the total balance

    // Write the records array to a CSV file
    await csvWriter.writeRecords(records);
    console.log('Balances have been written to balances.csv');
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();
