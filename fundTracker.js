import { Alchemy, Network } from "alchemy-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for Alchemy API
const networks = [
    { name: "Ethereum Mainnet", network: Network.ETH_MAINNET },
    { name: "Base Mainnet", network: Network.BASE_MAINNET },
    { name: "Optimism Mainnet", network: Network.OPT_MAINNET },
    { name: "Arbitrum Mainnet", network: Network.ARB_MAINNET }
];

const wallets = [
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
    "0xeca0B6454eFf51b7b6092cB85C7F6848b262BA19",
    "0x751c3268e710945Ad162b88CE52c05706f8C0a99"
];

const tokenAddresses = [
    "0xB1a03EdA10342529bBF8EB700a06C60441fEf25d",
    "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9",
    "0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE",
    "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    "0xae78736Cd615f374D3085123A210448E74Fc6393",
    "0xD101dCC414F310268c37eEb4cD376CcFA507F571",
    "0xD33526068D116cE69F19A9ee46F0bd304F21A51f",
    "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
    "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E",
    "0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198",
    "0x5aFE3855358E112B5647B952709E6165e1c1eEEe",
    "0x1121AcC14c63f3C872BFcA497d10926A6098AAc5",
    "0x9560e827af36c94d2ac33a39bce1fe78631088db",
    "0x4200000000000000000000000000000000000042",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "0xA202B2b7B4D2fe56BF81492FFDDA657FE512De07",
    "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    "0xbC1852F8940991d91BD2b09A5aBb5E7B8092a16C",
    "0x08bEa95Ec37829CBBdA9B556F340464d38546160",
];

const tokenDecimals = {
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 6, // USDC-E
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": 6, // USDC-B
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85": 6, // USDC-O
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831": 6, // USDC-A
    // Add more token-specific decimals here if needed
};

const tokenNames = [
    "MIGGLES",
    "AERO",
    "BSWAP",
    "TYBG",
    "DEGEN",
    "rETH",
    "RSC",
    "RPL",
    "GRT",
    "ILV",
    "BANK",
    "SAFE",
    "DOGE-E",
    "VELO",
    "OP",
    "USDC-E",
    "USDC-B",
    "USDC-O",
    "USDC-A",
    "BABYMIGGLES",
    "VIRTUALS",
    "BASEPRINTER",
    "BABYDEGEN",
];

const alchemyApiKey = "JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x"; // Replace with your Alchemy API key

// Output CSV file path
const outputFilePath = path.join(__dirname, "token_balances.csv");

// Utility function to retry an API call
async function retryAsync(fn, retries = 3, delayMs = 1000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            console.warn(`Retry ${attempt}/${retries}: ${error.message}`);
            if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw new Error(`Failed after ${retries} retries`);
}

// Function to fetch balances and save to CSV
async function fetchBalancesAndSaveToCSV() {
    let csvData = "Network,Wallet,Token,Balance\n"; // Initialize CSV with headers
    let tokenTotals = {}; // Object to track total token balances

    for (const network of networks) {
        console.log(`Fetching balances on ${network.name}...`);

        const alchemy = new Alchemy({
            apiKey: alchemyApiKey,
            network: network.network
        });

        for (const wallet of wallets) {
            console.log(`\nWallet: ${wallet}`);
            const response = await retryAsync(
                () => alchemy.core.getTokenBalances(wallet, tokenAddresses),
                3, // Number of retries
                2000 // Delay in milliseconds between retries
            );

            if (response.tokenBalances) {
                response.tokenBalances.forEach(({ contractAddress, tokenBalance }) => {
                    const decimals = tokenDecimals[contractAddress] || 18; // Default to 18 decimals
                    const balance = BigInt(tokenBalance || "0x0") / BigInt(10 ** decimals);

                    if (balance > 0) { // Filter out zero balances
                        const tokenIndex = tokenAddresses.indexOf(contractAddress);
                        const tokenName = tokenNames[tokenIndex] || contractAddress;

                        console.log(`Token: ${tokenName} | Balance: ${balance}`);

                        // Append data to CSV
                        csvData += `${network.name},${wallet},${tokenName},${balance}\n`;

                        // Update total token balance
                        if (tokenTotals[tokenName]) {
                            tokenTotals[tokenName] += balance;
                        } else {
                            tokenTotals[tokenName] = balance;
                        }
                    }
                });
            } else {
                console.log("No token balances found.");
            }
        }
    }

    // Add the total token balances to the CSV data
    csvData += "\nTotal Token Balances\n";
    for (const [token, totalBalance] of Object.entries(tokenTotals)) {
        csvData += `,Total,${token},${totalBalance}\n`;
    }

    fs.writeFileSync(outputFilePath, csvData, "utf8");
    console.log(`\nToken balances saved to ${outputFilePath}`);
}

// Run the script
fetchBalancesAndSaveToCSV().catch((error) => {
    console.error("Error fetching token balances:", error);
});
