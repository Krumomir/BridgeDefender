import express, { json } from 'express';
import { connectDB } from "./config/db";
import { addUser, fetchData } from "./service/db_service";
import EthAcc from './models/eth_acc';
import { parseEther, hexlify, ethers, WebSocketProvider, TransactionResponse } from 'ethers';
import { estimateGas, getGasPrice, getTransactionCount, wallet } from './service/rpc_service';
//import { TransactionResponse } from 'alchemy-sdk';
require('dotenv').config()

const app = express();
const port = 3000;

const ABI = process.env.ABI;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/address/:address', async (req, res) => {
  try {
    const acc = await EthAcc.findOne({ address: req.params.address });

    if (!acc) {
      res.status(404).send('Address not supported!');
      return;
    }

    res.status(200).send(acc);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

const senderAccount = process.env.MY_ADDRESS;

app.post('/sendEther/:amount', async (req, res) => {
  const recieverAmount = req.params.amount;
  if (!recieverAmount) {
    res.status(400).send('No amount provided');
    return;
  }

  if (parseFloat(recieverAmount) <= 0) {
    res.status(400).send('Amount must be greater than 0');
    return;
  }

  const { recieverAddress } = req.body;
  let nounce = await getTransactionCount(senderAccount);

  const tx = {
    from: senderAccount,
    to: recieverAddress,
    value: parseEther(recieverAmount),
    nonce: nounce,
    gasLimit: await estimateGas(senderAccount, recieverAddress, recieverAmount),
    gasPrice: await getGasPrice(),
  };

  wallet.sendTransaction(tx).then((transaction) => {
    console.dir(transaction)
    console.log(hexlify(transaction.hash))
    res.status(200).send('Ether sent successfully!');
  });
});

const provider = new WebSocketProvider(
  "ws://localhost:8545"
);

function decodeTransaction(tx: TransactionResponse) {
  const iface = new ethers.Interface(ABI);
  return iface.parseTransaction({ data: tx.data, value: tx.value.toString() })
}

function getEncodedTransactionHash(tx: TransactionResponse, _transactionHash: string) {
  const decodedTx = decodeTransaction(tx);
  const assetID = BigInt(decodedTx.args[0]);
  const amount = BigInt(decodedTx.args[1]);
  const sorceChain = BigInt(tx.chainId);
  const executor = tx.from;

  const abi = ["bytes32", "address", "uint256", "uint16", "uint256"];
  const values = [_transactionHash, executor, amount, assetID, sorceChain];
  return ethers.solidityPackedKeccak256(abi, values);
}

function isValidTransaction(tx: TransactionResponse) {
  return tx == null;
}

async function getTransfer() {

  const bridgeAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
  const contract = new ethers.Contract(bridgeAddress, ABI, provider);

  await contract.on("Approved", async (proposalHash, _transactionHash) => {
    console.log("Approved event:");
    console.log("Proposal hash:", proposalHash);
    console.log("Transaction hash:", _transactionHash);

    //get transaction with _transactionHash
    //if transaction doesn't exist, call defend function
    const tx = await provider.getTransaction(_transactionHash);
    if (isValidTransaction(tx)) {
      console.log("Transaction not found");
      provider.send("defend", proposalHash);
      // const proposal = await provider.send("proposals", proposalHash);
      // console.log(proposal);
      return false;
    }
    console.log(tx);

    //calculate proposal hash with Lock parameters using Keccak256
    const encodedTransactionHash = getEncodedTransactionHash(tx, _transactionHash);
    console.log("Encoded transaction hash:", encodedTransactionHash);

    //compare proposal hash with calculated hash
    //if hashes don't match, call defend function
    if (encodedTransactionHash == proposalHash) {
      console.log("Hashes match");
      return true;
    }
    else {
      console.log("Hashes don't match");
      provider.send("defend", proposalHash);
      // const proposal = await provider.send("proposals", proposalHash);
      // console.log(proposal);
      return false;
    }
  });
}

// app.listen(port, () => {
//   return console.log(`Express is listening at http://localhost:${port}`);
// });

async function getAllTransfersFromBlock(contract, startBlock) {
  contract.queryFilter("SendMsg", startBlock).then((events) => {
    console.log(events);
  });
}

connectDB();
//getAllTransfersFromBlock(contract, 17669455);
getTransfer();

export default app;
export { getEncodedTransactionHash, decodeTransaction, isValidTransaction }