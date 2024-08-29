import mongoose, { Schema } from 'mongoose';
import { INetwork } from '../interfaces';

const networkSchema = new Schema<INetwork>({
  _id: String,
  name: String,
  chainId: { type: Number, unique: true },
  rpcUrl: String,
  logo: String,
  startBlock: Number,
  lastVisitedBlock: Number,
  contractAddress: String,
});

export const QuantumPortalNetworkModel = mongoose.model(
  'quantumPortalNetwork',
  networkSchema,
);
