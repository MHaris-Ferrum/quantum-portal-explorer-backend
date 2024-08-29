import { ObjectId } from 'mongoose';

export interface INetwork {
  _id?: ObjectId;
  name: string;
  chainId: number;
  rpcUrl: string;
  logo: string;
  startBlock: number;
  lastVisitedBlock: number;
  contractAddress: string;
}
