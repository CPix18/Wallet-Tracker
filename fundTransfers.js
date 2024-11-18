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
    { name: "Arbitrum Mainnet", network: Network.ARB_MAINNET },
];

// List of wallet addresses to monitor
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
    "0x46db2fbfe2bbe35b66c70cc9e1dc61f82a6a8ff5",
    "0x3442BFf38Da294EC9cfa7ecD29581cb048aE9107",
    "0xeca0B6454eFf51b7b6092cB85C7F6848b262BA19",
];

const alchemyApiKey = "JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x"; // Replace with your Alchemy API key

// Output CSV file path
const outputFilePath = path.join(__dirname, "transfers_log.csv");

// Retry logic configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Function to fetch asset transfers with retry logic
async function fetchTransfersWithRetry(alchemy, wallet, retries = 0) {
    try {
        const transfers = await alchemy.core.getAssetTransfers({
            fromAddress: wallet,
            category: ["erc20", "external"],
            withMetadata: true,
        });
        return transfers;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            console.log(`Error fetching transfers for wallet: ${wallet}. Retrying... (${retries + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchTransfersWithRetry(alchemy, wallet, retries + 1);
        } else {
            console.error(`Failed to fetch transfers for wallet: ${wallet} after ${MAX_RETRIES} attempts.`);
            return null; // Return null if all retries fail
        }
    }
}

// Function to format timestamp into a readable date string
function formatTimestamp(timestamp) {
    const date = new Date(timestamp); // Convert from ISO 8601 string (timestamp is already in milliseconds)
    return date.toLocaleString(); // Return in a readable date format
}

// Function to log transfers
async function logTransfers() {
    let csvData = "Network,Wallet,Token,Transaction Hash,To Address,Date/Time\n";

    for (const network of networks) {
        console.log(`Monitoring transfers on ${network.name}...`);

        const alchemy = new Alchemy({
            apiKey: alchemyApiKey,
            network: network.network,
        });

        for (const wallet of wallets) {
            console.log(`\nChecking wallet: ${wallet}`);

            // Fetch asset transfers with retry mechanism
            const transfers = await fetchTransfersWithRetry(alchemy, wallet);

            if (!transfers || !transfers.transfers || transfers.transfers.length === 0) {
                console.log(`No transfers found for wallet: ${wallet} on ${network.name}. Skipping...`);
                continue; // Skip to the next wallet
            }

            transfers.transfers.forEach((transfer) => {
                const { to, hash, asset, value, metadata } = transfer;
                const tokenName = asset || "Unknown";
                const transactionDate = formatTimestamp(metadata.blockTimestamp); // Extract timestamp from metadata

                console.log(`Token: ${tokenName}, Hash: ${hash}, To: ${to}, Date/Time: ${transactionDate}`);

                // Append transfer details to CSV
                csvData += `${network.name},${wallet},${tokenName},${hash},${to},${transactionDate}\n`;
            });
        }
    }

    // Save the transfers data to a CSV file
    fs.writeFileSync(outputFilePath, csvData);
    console.log("Transfers log saved to transfers_log.csv.");
}

// Start logging transfers
logTransfers().catch((err) => {
    console.error("Error while logging transfers:", err);
});