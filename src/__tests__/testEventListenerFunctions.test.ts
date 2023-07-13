import { ethers, TransactionReceipt } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { decodeTransaction, getEncodedTransactionHash } from '../app';
import { BigNumber } from 'bignumber';
import { WebSocketProvider } from 'ethers';
require('dotenv').config()

describe('decodeTransaction', () => {
    const transactionHash = '0xa933d96fb414036610a7b94f54e258441e6d16d34ede1ed5f844fbdcb9e421da'
    const provider = new WebSocketProvider(
        process.env.WEBSOCKETPROVIDER
    )

    const tx =  provider.getTransaction(transactionHash).then((tx) => {
        it('should decode a transaction correctly', () => {
            const decodedTx = decodeTransaction(tx);
            expect(decodedTx.value).toEqual(BigNumber('0'));
        });
    });
});

describe('getEncodedTransactionHash', () => {
  it('should return the correct encoded transaction hash', () => {
    const transactionHash = '0xa933d96fb414036610a7b94f54e258441e6d16d34ede1ed5f844fbdcb9e421da'
    const provider = new WebSocketProvider(
        process.env.WEBSOCKETPROVIDER
    )
    
    const tx = provider.getTransaction(transactionHash).then((tx) => {
        const encodedTxHash = getEncodedTransactionHash(tx, transactionHash);
        expect(encodedTxHash).toBe('0x17736268884f187652180155224521682849373c52d9649e07ed9d8ace12e4e3');
    });
  });
});