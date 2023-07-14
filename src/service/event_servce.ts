import { ethers, TransactionResponse } from 'ethers';
import { wsProvider } from '../service/rpc_service';

const ABI  =
require("../../bridge-abi.json").abi;

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
  
  async function eventListener(): Promise<void>{
  
    const bridgeAddress = process.env.BRIDGE_ADDRESS;
    const contract = new ethers.Contract(bridgeAddress, ABI, wsProvider);
  
    contract.on("Approved", async (proposalHash, _transactionHash) => {
      console.log("Approved event:");
      console.log("Proposal hash:", proposalHash);
      console.log("Transaction hash:", _transactionHash);
  
      //get transaction with _transactionHash
      //if transaction doesn't exist, call defend function
      const tx = await wsProvider.getTransaction(_transactionHash);
      if (isValidTransaction(tx)) {
        console.log("Transaction not found");
        wsProvider.send("defend", proposalHash);
        // const proposal = await provider.send("proposals", proposalHash);
        // console.log(proposal);
        return;
      }
      console.log(tx);
  
      //calculate proposal hash with Lock parameters using Keccak256
      const encodedTransactionHash = getEncodedTransactionHash(tx, _transactionHash);
      console.log("Encoded transaction hash:", encodedTransactionHash);
  
      //compare proposal hash with calculated hash
      //if hashes don't match, call defend function
      if (encodedTransactionHash == proposalHash) {
        console.log("Hashes match");
        return;
      }
      else {
        console.log("Hashes don't match");
        wsProvider.send("defend", proposalHash);
        // const proposal = await provider.send("proposals", proposalHash);
        // console.log(proposal);
        return;
      }
    });
  }
  
  export { eventListener, decodeTransaction, getEncodedTransactionHash }