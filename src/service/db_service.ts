import { IEthereumAcc } from "../models/eth_acc";
import { getBlockNumber, getBlock, getTransaction, getBalance } from '../service/rpc_service';
import EthAcc from '../models/eth_acc';

async function addUser(newAcc: IEthereumAcc) {
    const newUser = await newAcc.save();
}

const addresses = [
    '0x369052fE460cf5D3AE7e87451C8b4b867bDa493B',
    '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
    '0x312CAf4a47C8d829F568c99B3c51CB43D4335E02',
  ];
  
  async function fetchData(address: string): Promise<IEthereumAcc> {
    const currentBlock = await getBlockNumber();
    const block = await getBlock(currentBlock);
    const transactions = new Array<string>();
  
    for (const tx of block.transactions) {
      const transaction = await getTransaction(tx);
  
      if (transaction.from == address) {
        transactions.push(tx);
      }
    }
  
    const balance = await getBalance(address);
  
    return new EthAcc({ address: address, current_block: currentBlock, txs: transactions, balance: balance });
  }
  
  (async () => {
    for (const address of addresses) {
      addUser(await fetchData(address));
    }
  })();

export { addUser, fetchData }