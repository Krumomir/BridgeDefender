import { Block, JsonRpcProvider, ethers } from "ethers";

const mainnet = "https://eth-mainnet.g.alchemy.com/v2/" + process.env.MAINNET_ALCHEMY_KEY;
const testnet = "https://eth-sepolia.g.alchemy.com/v2/" + process.env.SEPOLIA_ALCHEMY_KEY;

const mainProvider = new JsonRpcProvider(mainnet);
const testProvider = new JsonRpcProvider(testnet);
const martoAddress = '0x77C9EF0FD9f22ca390a6267e46fB6092fb8d87C1';
const myAddress = '0x21a3884770F1E039b2a8F9BDD4483f3937176bF3';
const myPrivateKey = process.env.WALLET_KEY as string;
const wallet = new ethers.Wallet(myPrivateKey, testProvider);

async function getBlockNumber(): Promise<number> {
    return await mainProvider.getBlockNumber();
}

function getBlock(blockNumber: number): Promise<Block> {
    return mainProvider.getBlock(blockNumber);
}

function getTransaction(txHash: string): Promise<ethers.TransactionResponse> {
    return mainProvider.getTransaction(txHash);
}

async function getBalance(address: string): Promise<string> {
    return (await mainProvider.getBalance(address)).toString();
}

async function getTransactionCount(senderAccount: string): Promise<number> {
    return await testProvider.getTransactionCount(senderAccount);
}

async function getGasPrice(): Promise<bigint> {
    return (await testProvider.getFeeData()).gasPrice;
}

async function estimateGas(senderAccount: string, recieverAddress: string, value: string): Promise<bigint> {
    return await testProvider.estimateGas({
        from: senderAccount,
        to: recieverAddress,
        value: ethers.parseEther(value),
    });
}

export { estimateGas, getGasPrice, getTransactionCount, getBlockNumber, getBlock, getTransaction, getBalance, mainProvider, testProvider, martoAddress, myAddress, myPrivateKey }