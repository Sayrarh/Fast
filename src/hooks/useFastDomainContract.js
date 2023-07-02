import { useContract } from "./useContract";
import FastDomain from "../contracts/FastDomain.json";
import FastDomainAddress from "../contracts/FastDomainAddress.json";

// export interface for smart contract
export const useFastDomainContract = () =>
  useContract(FastDomain.abi, FastDomainAddress.FastDomain);

