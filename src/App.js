/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import { useWeb3React } from "@web3-react/core";
import { Button, Card, Col, Descriptions, message, Row } from "antd";
import { useEffect, useState } from "react";
import Web3 from "web3";
import { getTokenContract, getRewardPoolContract } from "./abi/contract";
import "./App.css";
import CustomModal from "./components/Modal";
import { REWARD_POOL_SC, TIME_DURATION, TOKEN_SC } from "./utils/constant";
import { EllipsisMiddle } from "./utils/functions";
import tokenABI from "./abi/TOKEN.json";
import rewardPoolABI from "./abi/REWARD_POOL.json";
import { Multicall } from "ethereum-multicall";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import moment from 'moment';
import axios from "axios";
import HistoryTable from "./components/HistoryTable";
import ConnectWallet from "./components/ConnectWallet";

const endpoint = "https://api.thegraph.com/subgraphs/name/sotatek-tuyennguyen/web3-demo";
const headers = {
  "content-type": "application/json",
};

function App() {
  const { account, library } = useWeb3React();
  const [loadingButton, setLoadingButton] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [stakeModal, setStakeModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [yourStake, setYourStake] = useState(0);
  const [tokenEarned, setTokenEarned] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [isApprove, setApprove] = useState(0);
  const [historyData, setHistoryData] = useState([]);
  const web3 = new Web3(library?.provider);
  const multicall = new Multicall({
    web3Instance: web3,
    tryAggregate: true,
  });

  // Fetch data from subgraph
  const fetchHistory = async (account) => {
    try {
      const response = await axios({
        url: endpoint,
        method: "POST",
        headers: headers,
        data: {
          "query": `
          {depositEntities(orderBy: time, orderDirection:desc, first: 5, where:{
            user: "${account}"
            }) {
              id
              time
              user
              amount
            }
          withdrawEntities(orderBy: time, orderDirection:desc, first: 5, where:{
                user: "${account}"
          }) {
            id
            time
            user
            amount
          }}`,
          "variables": null,
        },
      });

      const depositHistory:[] = response.data.data.depositEntities;
      const listDepositEntitiesIds = depositHistory.map((des)=> des.id)
      const historyResponse = [...response.data.data.depositEntities, ...response.data.data.withdrawEntities];


      const sortHistoryByTime = historyResponse.sort(function(x, y){
        return x.time - y.time;
      }).reverse()

      const historyData = sortHistoryByTime.map(rec => {
        return {
          id: rec.id,
          action: listDepositEntitiesIds.includes(rec.id) ? "Deposit" : "Withdraw",
          amount: web3.utils.fromWei(rec.amount),
          time: moment.unix(rec.time).format("HH:mm:ss DD-MM-YYYY"),
        }
      })
      setHistoryData(historyData);
    } catch (error) {
      console.log(error);
    }
  }


  const contractCallContext = [
    {
      reference: "userBalance",
      contractAddress: TOKEN_SC,
      abi: tokenABI,
      calls: [
        {
          reference: "balance",
          methodName: "balanceOf",
          methodParameters: [account],
        },
      ],
    },
    {
      reference: "userStake",
      contractAddress: REWARD_POOL_SC,
      abi: rewardPoolABI,
      calls: [
        {
          reference: "userStake",
          methodName: "userInfo",
          methodParameters: [account],
        },
      ],
    },
    {
      reference: "tokenEarned",
      contractAddress: REWARD_POOL_SC,
      abi: rewardPoolABI,
      calls: [
        {
          reference: "tokenEarned",
          methodName: "pendingReward",
          methodParameters: [account],
        },
      ],
    },
    {
      reference: "totalStaked",
      contractAddress: REWARD_POOL_SC,
      abi: rewardPoolABI,
      calls: [
        {
          reference: "totalStaked",
          methodName: "currentTotalStaked",
          methodParameters: [],
        },
      ],
    },
  ];

  //get data with multicall
  const getMulticalData = async () => {
    try {
      const results = await multicall.call(contractCallContext);
      setBalance(
          ethers.utils.formatEther(
              BigNumber.from(
                  results.results.userBalance.callsReturnContext[0].returnValues[0]
                      .hex
              )
          )
      );
      setYourStake(
          ethers.utils.formatEther(
              BigNumber.from(
                  results.results.userStake.callsReturnContext[0].returnValues[0].hex
              )
          )
      );
      setTokenEarned(
          ethers.utils.formatEther(
              BigNumber.from(
                  results.results.tokenEarned.callsReturnContext[0].returnValues[0]
                      .hex
              )
          )
      );
      setTotalStaked(
          ethers.utils.formatEther(
              BigNumber.from(
                  results.results.totalStaked.callsReturnContext[0].returnValues[0]
                      .hex
              )
          )
      );
      console.log(results);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseStakeModal = () => {
    setStakeModal(false);
  };

  const handleCloseWithdrawModal = () => {
    setWithdrawModal(false);
  };

  const handleOpenStakeModal = () => {
    setStakeModal(true);
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawModal(true);
  };

  const checkAllowance = async () => {
    const { tokenContract } = getTokenContract(library.provider);
    const isAllowance = await tokenContract.methods
        .allowance(account, REWARD_POOL_SC)
        .call();
    setApprove(isAllowance);
  };

  // Approve
  const handleApprove = async () => {
    const { web3, tokenContract } = getTokenContract(library.provider);

    if(parseFloat(balance) === 0) {
      message.error({
        content: "Insufficient WETH balance",
        duration: TIME_DURATION,
      });

      return;
    }

    if(account) {
      try {
        setLoadingApprove(true);
        await tokenContract.methods
            .approve(REWARD_POOL_SC, web3.utils.toWei(balance))
            .send({ from: account });

        checkAllowance();
        setLoadingApprove(false);
      } catch (error) {
        setLoadingApprove(false);
        console.log(error);
      }
    }

  };

  // Deposit
  const handleDeposit = async (amount) => {
    const { web3, rewardPoolContract } = getRewardPoolContract(
        library.provider
    );

    if (amount > parseFloat(balance)) {
      message.error({
        content: "Insufficient funds",
        duration: TIME_DURATION,
      });
    } else if (account) {
      try {
        setLoadingButton(true);
        const depositRes = await rewardPoolContract.methods
            .deposit(web3.utils.toWei(amount.toString()))
            .send({ from: account });

        if (depositRes) {
          message.success({
            content: "Transaction Success",
            duration: TIME_DURATION,
          });
          handleCloseStakeModal();
          getStaticInfo();
          setLoadingButton(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  //Withdraw
  const handleWithdraw = async (amount) => {
    const { web3, rewardPoolContract } = getRewardPoolContract(
        library.provider
    );

    if (amount > parseFloat(yourStake)) {
      message.error({
        content: "Insufficient funds",
        duration: TIME_DURATION,
      });
    } else if (account) {
      try {
        setLoadingButton(true);
        const depositRes = await rewardPoolContract.methods
            .withdraw(web3.utils.toWei(amount.toString()))
            .send({ from: account });

        if (depositRes) {
          message.success({
            content: "Transaction Success",
            duration: TIME_DURATION,
          });
          handleCloseStakeModal();
          getStaticInfo();
          setLoadingButton(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Claim
  const handleClaim = async () => {
    const { rewardPoolContract } = getRewardPoolContract(library.provider);

    try {
      setLoadingClaim(true);
      const claimRes = await rewardPoolContract.methods
          .claim()
          .send({ from: account });

      console.log('claimRes',claimRes);
      if (claimRes) {
        message.success({
          content: "Transaction Success",
          duration: TIME_DURATION,
        });
        handleCloseStakeModal();
        getStaticInfo();
        setLoadingClaim(false);
      }
      setLoadingClaim(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getStaticInfo = async () => {
    await getMulticalData();
    await fetchHistory(account);
  };

  useEffect(() => {
    if (account && library) {
      getStaticInfo();
      checkAllowance();
    }
  }, [account, library]);

  const renderStake = () => {
    return (
        <div className="stake__container">
          <Row gutter={16}>
            <Col span={12}>
              <Card bordered={true}>
                <Descriptions
                    title="Stake Detail"
                    bordered
                    size="middle"
                    column={2}
                >
                  <Descriptions.Item label="Wallet Address">
                    {account && EllipsisMiddle(account)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Balance">
                    {balance && balance} <strong>Token</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Token Earned">
                    {tokenEarned} <strong>Token</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Your Stake">
                    {yourStake} <strong>Token</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Staked">
                    {totalStaked} <strong>Token</strong>
                  </Descriptions.Item>
                  <Descriptions.Item>
                    <Button
                        type="primary"
                        block
                        onClick={handleClaim}
                        loading={loadingClaim}
                    >
                      Claim
                    </Button>
                  </Descriptions.Item>
                </Descriptions>
                <div className="stake__action">
                  {parseFloat(isApprove) ? (
                      <>
                        <Button onClick={handleOpenStakeModal} className="deposit">
                          Deposit
                        </Button>
                        <Button
                            onClick={handleOpenWithdrawModal}
                            className="withdraw"
                        >
                          Withdraw
                        </Button>
                      </>
                  ) : (
                      <Button loading={loadingApprove} onClick={handleApprove} className="approve">
                        Approve
                      </Button>
                  )}
                </div>
                <CustomModal
                    title={"Stake"}
                    isModalVisible={stakeModal}
                    handleCancel={handleCloseStakeModal}
                    handleAction={handleDeposit}
                    loading={loadingButton}
                    modalInfoName={"Your Token balance"}
                    modalInfoValue={balance}
                />
                <CustomModal
                    title={"Withdraw"}
                    isModalVisible={withdrawModal}
                    handleCancel={handleCloseWithdrawModal}
                    handleAction={handleWithdraw}
                    loading={loadingButton}
                    modalInfoName={"Your Token deposited"}
                    modalInfoValue={yourStake}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="History of Account" bordered={true}>
                <HistoryTable history={historyData}/>
              </Card>
            </Col>
          </Row>
        </div>
    );
  };

  return (
      <div className="App">
        {!account ? <ConnectWallet/> : renderStake()}
      </div>
  );
}


export default App;
