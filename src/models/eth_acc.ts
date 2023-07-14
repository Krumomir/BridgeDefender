import mongoose, { Schema, Document } from 'mongoose';

interface IEthereumAcc extends Document {
  address: string;
  balance: string;
  current_block: number;
  txs: string[];
}

const EtherumAcc: Schema = new Schema({
    address: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: String, 
        required: true 
    },
    current_block: { 
        type: Number, 
        required: true
    },
    txs: { 
        type: [String],
         required: true
    },
});

const EthAcc = mongoose.model<IEthereumAcc>('Ethereum model', EtherumAcc);

export default EthAcc;
export { IEthereumAcc };