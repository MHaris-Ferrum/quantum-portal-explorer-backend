import axios from 'axios';
import * as blockService from './block.service';
import * as transactionsService from './transaction.service';
import * as networkService from './network.service';
import config from '../config/config';
import { ethers } from 'ethers';
import * as LEDGER_MANAGER from '../utils/abi/ledgerMgr.json';
import { INetwork } from '../interfaces';

// export const processBlockAndTransaction = async (
//   startBlock: number,
//   endBlock: number,
// ): Promise<any> => {
//   console.log('node sync running', startBlock, endBlock);
//   for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
//     console.log(`Fetching block ${blockNumber}`);
//     try {
//       const url = config.explorerUrl;
//       const block: any = await axios.get(`${url}/api/v2/blocks/${blockNumber}`);

//       await blockService.saveBlock({
//         hash: block.data.hash,
//         parentHash: block.data.parent_hash,
//         number: block.data.height,
//         nonce: block.data.nonce,
//         timestamp: block.data.timestamp,
//         difficulty: block.data.difficulty,
//         gasLimit: block.data.gas_limit,
//         gasUsed: block.data.gas_used,
//         miner: block.data.miner.hash,
//         baseFeePerGas: block.data.base_fee_per_gas,
//         txCount: block.data.tx_count,
//         rewards: block.data.rewards,
//         txsFees: block.data.tx_fees,
//         totalDifficulty: block.data.total_difficulty,
//       });
//       console.log(`Block ${blockNumber} saved`);
//       console.log(
//         `Block ${blockNumber} has ${block?.data?.tx_count} transactions`,
//       );
//       if (block?.data?.tx_count > 0) {
//         const txs = await axios.get(
//           `${url}/api/v2/blocks/${blockNumber}/transactions`,
//         );
//         txs?.data?.items?.forEach(async (tx: any) => {
//           console.log(`Fetching transaction ${tx.hash}`);
//           const logs = await axios.get(
//             `${url}/api/v2/transactions/${tx.hash}/logs`,
//           );
//           console.log(
//             `Transaction ${tx.hash} has ${logs?.data?.items?.length} logs`,
//           );
//           const saved = await transactionsService.saveTransaction({
//             hash: tx.hash,
//             type: tx.type,
//             blockNumber: tx.block,
//             status: tx.status,
//             method: tx.method,
//             timestamp: tx.timestamp,
//             from: tx?.from?.hash,
//             fromDetails: tx?.from,
//             to: tx?.to?.hash,
//             toDetails: tx?.to,
//             block: tx?.block,
//             value: tx?.value,
//             fee: tx?.fee?.value,
//             gasLimit: tx?.gas_limit,
//             gasUsed: tx?.gas_used,
//             gasPrice: tx?.gas_price,
//             inputData: tx?.raw_input,
//             decodedInput: tx?.decoded_input,
//             logs: logs?.data?.items,
//             nonce: tx?.nonce,
//             position: tx?.position,
//             confirmations: tx?.confirmations,
//             priorityFee: tx?.priority_fee,
//             maxPriorityFeePerGas: tx?.max_priority_fee_per_gas,
//             baseFeePerGas: tx?.base_fee_per_gas,
//             maxFeePerGas: tx?.max_fee_per_gas,
//           });
//           console.log(`Transaction ${saved?.hash} saved`);
//         });
//       } else {
//         console.log(`Block ${blockNumber} is empty`);
//       }
//     } catch (error) {
//       console.error(`Error fetching block ${blockNumber}:`, error);
//     }
//   }
//   return;
// };

export const getBlocksForContract = async (network: INetwork) => {
  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
  const latestBlock = await provider.getBlockNumber();
  // Define an array to store relevant blocks
  let relevantBlocks = [];

  // Loop through blocks to find transactions involving the contract
  for (let i = network.lastVisitedBlock; i <= latestBlock; i++) {
    console.log(`Checking Block: ${i} and latest block is ${latestBlock}`);
    // Get the block with its transactions
    const block = await provider.getBlockWithTransactions(i);

    // console.log(block);
    console.log(
      `Block ${block.number} has ${block.transactions.length} transactions`,
    );
    // Filter transactions to check if they involve the contract
    block.transactions.forEach(tx => {
      console.log(
        tx?.to?.toLowerCase(),
        tx?.from?.toLowerCase(),
        network?.contractAddress?.toLowerCase(),
        tx?.to?.toLowerCase() === network?.contractAddress?.toLowerCase(),
        tx?.from?.toLowerCase() === network?.contractAddress?.toLowerCase(),
      );
      if (
        (tx?.to &&
          tx?.to.toLowerCase() === network?.contractAddress?.toLowerCase()) ||
        (tx?.from &&
          tx?.from?.toLowerCase() === network?.contractAddress?.toLowerCase())
      ) {
        console.log(
          `Transaction found in Block: ${block.number}, Tx Hash: ${tx.hash}`,
        );
        console.log({ tx });

        decodeTransactionLogs(tx, network.contractAddress, network.rpcUrl);
        relevantBlocks.push(block.number);
      }
    });
    networkService.updateNetworkVisitedBlocks(network.chainId, block.number);
  }
};

const decodeTransactionLogs = async (
  tx: any,
  contractAddress: string,
  rpc: string,
) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  // Get the transaction receipt using the transaction hash
  const receipt = await provider.getTransactionReceipt(tx.hash);

  const abi = LEDGER_MANAGER.abi;

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, abi, provider);
  // Iterate over the logs
  const events: any[] = [];
  const decodedInput = contract.interface.parseTransaction({
    data: tx.data,
    value: tx.value,
  });
  console.log('Decoded Input:', decodedInput);
  console.log('Decoded Function Name:', decodedInput.name);
  console.log('Decoded Parameters:', decodedInput.args);

  receipt.logs.forEach(log => {
    try {
      // console.log({ log });
      // Try to decode the log using the contract's interface
      let data: any = {};
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog) {
        console.log('Event:', parsedLog);
        const eventArgs = parsedLog?.args;
        const name = parsedLog?.name;
        const signature = parsedLog?.signature;
        const topics = log?.topics;
        const address = log?.address;
        parsedLog?.eventFragment?.inputs.forEach((input: any, index: any) => {
          console.log({ inputType: typeof eventArgs[index] });
          if (input.type === 'tuple') {
            // console.log(`${input.name}:`);
            console.log({ inputType1: input.type });
            input.components.forEach((component: any, subIndex: any) => {
              console.log(`  ${component.name}: ${eventArgs[index][subIndex]}`);
              data[component.name] = eventArgs[index][subIndex];
            });
          } else {
            if (typeof eventArgs[index] == 'object') {
              console.log({ inputType2: input.type });
              data[input.name] = eventArgs[index];
            } else {
              console.log({ inputType3: input.type });
              data[input.name] = eventArgs[index];
            }
          }
        });
        console.log({ data });
        events.push({ name, signature, topics, address, data });
      }
    } catch (error) {
      console.log('Error parsing log:', error);
    }
  });
  console.log({ events });
};
