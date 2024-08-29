import Joi from 'joi';
import { objectId } from './custom';

export const createNetworks = {
  body: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().required(),
      rpcUrl: Joi.string().required(),
      chainId: Joi.number().required(),
      startBlock: Joi.number().required(),
      contractAddress: Joi.string().required(),
      lastVisitedBlock: Joi.number().required(),
      logo: Joi.string().required(),
    }),
  ),
};

export const getNetworkByName = {
  query: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

export const getNetwork = {
  params: Joi.object().keys({
    id: Joi.custom(objectId).required(),
  }),
};

export const deleteNetwork = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export const updateNetwork = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};
