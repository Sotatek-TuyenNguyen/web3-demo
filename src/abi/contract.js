import rewardPoolABI from "./REWARD_POOL.json";
import TokenABI from "./TOKEN.json";
import Web3 from "web3";

export const getTokenContract = (provider) => {
  const web3 = new Web3(provider);
  const tokenContract = new web3.eth.Contract(
    TokenABI,
    "0x2518EA4cAee40C54CAfA1c393ae4b56Bcf7cAcBE"
  );
  return { web3,  tokenContract };
};


export const getRewardPoolContract = (provider) => {
  const web3 = new Web3(provider);
  const rewardPoolContract = new web3.eth.Contract(
    rewardPoolABI,
    "0xF0c54801E775D83196b50067103D136682d37e3f"
  );
  return { web3, rewardPoolContract };
};
