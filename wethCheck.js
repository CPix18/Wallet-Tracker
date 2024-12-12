// Github: https://github.com/alchemyplatform/alchemy-sdk-js
// Setup: npm install alchemy-sdk
import { Network, Alchemy } from "alchemy-sdk";
import fs from "fs";
import path from "path";

// Alchemy API key (replace with your own)
const API_KEY = "JG-1nNegXEZoV42hQVsIvrlLs3JRQ13x";

// List of networks to check
const networks = [
    { name: "Ethereum Mainnet", network: Network.ETH_MAINNET },
    { name: "Base Mainnet", network: Network.BASE_MAINNET },
    { name: "Optimism Mainnet", network: Network.OPT_MAINNET },
    { name: "Arbitrum Mainnet", network: Network.ARB_MAINNET },
];

// List of wallets to check
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

// List of WETH token addresses
const wethContracts = [
    { network: "Arbitrum", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" },
    { network: "Optimism", address: "0x4200000000000000000000000000000000000006" },
    { network: "Ethereum", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    { network: "Base", address: "0x4200000000000000000000000000000000000006" },
];

// Output file path
const outputFilePath = path.join(process.cwd(), "weth_balances.csv");

// Utility function for retries
async function retryOperation(operation, retries = 3, delay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await operation(); // Try the operation
        } catch (error) {
            attempt++;
            console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
            if (attempt >= retries) {
                throw new Error(`Operation failed after ${retries} attempts: ${error.message}`);
            }
            await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        }
    }
}

// Function to fetch balances with retries
async function fetchWethBalances() {
    let totalWeth = 0;
    const balances = [];
    let csvData = "Network,Wallet,WETH Balance\n"; // CSV header

    for (const network of networks) {
        console.log(`Checking balances on ${network.name}...`);
        const alchemy = new Alchemy({ apiKey: API_KEY, network: network.network });

        for (const wallet of wallets) {
            for (const weth of wethContracts) {
                if (weth.network !== network.name.split(" ")[0]) continue;

                try {
                    // Wrap the balance fetching operation in the retry mechanism
                    const response = await retryOperation(async () => {
                        return await alchemy.core.getTokenBalances(wallet, [weth.address]);
                    });

                    const tokenBalanceRaw = response.tokenBalances[0]?.tokenBalance || "0x0";
                    const tokenBalance = Number(BigInt(tokenBalanceRaw)) / 10 ** 18;

                    console.log(`Wallet: ${wallet} | ${weth.network} WETH: ${tokenBalance}`);
                    balances.push({ wallet, network: network.name, weth: tokenBalance });
                    totalWeth += tokenBalance;

                    // Add to CSV data
                    csvData += `${network.name},${wallet},${tokenBalance.toFixed(6)}\n`;
                } catch (error) {
                    console.error(`Error fetching WETH balance for wallet ${wallet} on ${network.name}:`, error);
                }
            }
        }
    }

    // Add total WETH balance to CSV
    csvData += `Total,,${totalWeth.toFixed(6)}\n`;

    // Save to CSV
    fs.writeFileSync(outputFilePath, csvData, "utf8");
    console.log(`\nToken balances saved to ${outputFilePath}`);

    console.log("\nWETH Balances:");
    balances.forEach(({ wallet, network, weth }) =>
        console.log(`Wallet: ${wallet} | Network: ${network} | WETH: ${weth}`)
    );

    console.log(`\nTotal WETH across all wallets: ${totalWeth.toFixed(6)}`);
}

// Run the script
fetchWethBalances().catch((error) => {
    console.error("Error running the script:", error);
});
