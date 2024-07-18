import { transactionsService } from '../services';
import { NextFunction, Request, Response } from 'express';
import Web3 from 'web3';

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const transactions = await transactionsService.getTxs(
      req.query.page as any,
      req.query.limit as any,
      req.query.address as any,
    );
    res.send(transactions);
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tx = await transactionsService.getTransaction(req.params.txId);
    const myNetwork = (global as any).networks;
    const matchedItem = myNetwork?.find((item: any) => {
      return tx.networkId === item.name || tx.remoteNetworkId === item.name;
    });
    const rpcUrl = matchedItem.rpcUrl;
    const web3 = new Web3(rpcUrl);
    const response = await web3.eth.getTransactionReceipt(
      req.params.txId as string,
    );
    if (response?.logs) {
      res.send({
        tx,
        logs: response.logs,
      });
    } else {
      res.send({
        tx,
        logs: [],
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getTransactionMinedAndFinalizedDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const response =
      await transactionsService.fetchRemoteTransactionWithMinedAndFinalizedTx(
        req.params.txId,
      );
    res.send(response);
  } catch (error) {
    next(error);
  }
};
