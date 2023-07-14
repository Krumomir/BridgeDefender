import { Request, Response } from 'express';
import  EthAcc from '../models/eth_acc';
import { getTransactionCount, estimateGas, getGasPrice, wallet, senderAccount } from '../service/rpc_service';
import { parseEther } from 'ethers';

function helloWorldHandler(req: Request, res: Response) {
  res.send('Hello World!');
}

async function addressHandler(req: Request, res: Response) {
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
}

async function sendEtherHandler(req: Request, res: Response) {
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
    // console.dir(transaction)
    // console.log(hexlify(transaction.hash))
    res.status(200).send('Ether sent successfully!');
  });
}

export { helloWorldHandler, addressHandler, sendEtherHandler }