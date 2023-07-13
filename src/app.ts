import express, { json } from 'express';
import { connectDB } from "./config/db";
import { addUser, fetchData } from "./service/db_service";
import EthAcc from './models/eth_acc';
import { parseEther, hexlify, ethers, WebSocketProvider, AbiCoder } from 'ethers';
import { estimateGas, getGasPrice, getTransactionCount, myAddress, myPrivateKey, testProvider } from './service/rpc_service';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/address/:address', async (req, res) => {
  if (!req.params.address) {
    res.status(400).send('No Address provided')
    return;
  }

  try {
    const acc = await EthAcc.findOne({ address: req.params.address });

    if (!acc) {
      res.status(404).send('Address not supported!');
      return;
    }

    res.send(acc);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

const senderAccount = myAddress;

app.post('/sendEther/:amount', async (req, res) => {
  if (!req.params.amount) {
    res.status(400).send('No amount provided');
    return;
  }

  const recieverAmount = req.params.amount;
  if (parseInt(recieverAmount) <= 0) {
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
    res.send(transaction);
  });
});

const ABI = require("../../Bridge/artifacts/contracts/Bridge.sol/Bridge.json").abi;

const provider = new WebSocketProvider(
  "ws://localhost:8545"
);

const bridgeAddress = "0x6212cb549De37c25071cF506aB7E115D140D9e42";
const contract = new ethers.Contract(bridgeAddress, ABI, provider);

async function getTransfer() {
  await contract.on("Approved", async (proposalHash, _transactionHash) => {
    console.log("Approved event:");
    console.log("Proposal hash:", proposalHash);
    console.log("Transaction hash:", _transactionHash);

    //get transaction with _transactionHash
    const tx = await provider.getTransaction(_transactionHash);
    console.log(tx);

    //decode transaction.data
    const iface = new ethers.Interface(ABI);
    const decodedTx = iface.parseTransaction({data: tx.data, value: tx.value})

    //get Lock parameters
    const assetID = BigInt(decodedTx.args[0]);
    const amount = BigInt(decodedTx.args[1]);
    const targetChain = BigInt(decodedTx.args[2]);

    const sorceChain = BigInt(tx.chainId);
    const executor = tx.from;

    console.log("Asset ID:", assetID.toString());
    console.log("Amount:", amount.toString());
    console.log("Target chain:", targetChain.toString());
    console.log("Source chain:", sorceChain.toString());
    console.log("Executor:", executor);
    console.log("Proposal hash:", proposalHash);

    //calculate proposal hash with Lock parameters using Keccak256
    const abi = ["bytes32", "address", "uint256", "uint16", "uint256"];
    const values = [_transactionHash, executor, amount, assetID, sorceChain];
    const encodedTransactionHash = ethers.solidityPackedKeccak256(abi, values)
    console.log("Encoded transaction hash:", encodedTransactionHash);

    //compare proposal hash with calculated hash
    //if hashes match, do nothing
    //if hashes don't match, call defend function
    if(encodedTransactionHash == proposalHash) {
      console.log("Hashes match");
    }
    else {
      console.log("Hashes don't match");
      provider.send("defend", proposalHash);
      const proposal = await provider.send("proposals", proposalHash);
      console.log(proposal);
    }
  });
}

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

async function getAllTransfersFromBlock(startBlock) {
  contract.queryFilter("SendMsg", startBlock).then((events) => {
    console.log(events);
  });
}

connectDB();
//getAllTransfersFromBlock(17669455);
getTransfer();