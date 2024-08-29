import { CronJob } from 'cron';
import nodeSync from './nodeSync';
import { nodeService, networkService } from '../services';

const nodeSyncJob = new CronJob(
  '*/1 * * * *',
  function () {
    nodeSync();
  },
  null,
  true,
);

export const startJobs = async () => {
  console.log('Starting jobs');
  const networks = await networkService.getAllNetworks();
  for (const network of networks) {
    await nodeService.getBlocksForContract(network);
  }
  // await nodeService.processBlockAndTransaction(lastVisitedBlock, currentBlock);
};
export default startJobs;
