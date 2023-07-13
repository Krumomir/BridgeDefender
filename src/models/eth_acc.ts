import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for your schema
interface IEthereumAcc extends Document {
  address: string;
  balance: string;
  current_block: number;
  txs: string[];
}

// Define the schema
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

// Create the model
const EthAcc = mongoose.model<IEthereumAcc>('Ethereum model', EtherumAcc);

export default EthAcc;
export { IEthereumAcc };