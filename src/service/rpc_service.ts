import { Block, JsonRpcProvider, ethers } from "ethers";
require('dotenv').config()

const mainnet = "https://eth-mainnet.g.alchemy.com/v2/" + process.env.MAINNET_ALCHEMY_KEY;
const testnet = "https://eth-sepolia.g.alchemy.com/v2/" + process.env.SEPOLIA_ALCHEMY_KEY;

const mainProvider = new JsonRpcProvider(mainnet);
const testProvider = new JsonRpcProvider(testnet);
const myPrivateKey = process.env.PRIVATE_KEY;

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

export { estimateGas, getGasPrice, getTransactionCount, getBlockNumber, getBlock, getTransaction, getBalance, wallet, mainProvider, testProvider, myPrivateKey }