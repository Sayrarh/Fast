import { useContract } from "./useContract";
import FastToken from "../contracts/FastToken.json";
import FastDomainAddress from "../contracts/FastDomainAddress.json";

// export interface for smart contract
export const useTokenContract = () =>
  useContract(FastToken.abi, FastDomainAddress.FastToken);
