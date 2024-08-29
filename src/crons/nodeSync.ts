import { nodeService, blockService } from '../services';
import { ethers } from 'ethers';
import config from '../config/config';
import { NETWORK_CONTRACT_ADDRESSES } from '../utils/constants';

const nodeSyncJob = async () => {
  const rpc = config.rpcUrl;
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const currentBlock = await provider.getBlockNumber();
  const lastVisitedBlock = await blockService.getLastBlockNumber();
  // await nodeService.getBlocksForContract(
  //   NETWORK_CONTRACT_ADDRESSES['BASE'],
  //   'https://base.llamarpc.com',
  // );
  // await nodeService.processBlockAndTransaction(lastVisitedBlock, currentBlock);
};
export default nodeSyncJob;
