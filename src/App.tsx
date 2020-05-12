import React, {useCallback, useEffect, useMemo} from 'react';
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import MainPage from './pages/MainPage';
import orbsRewardsDistributionContractJSON from './contracts/OrbsRewardsDistribution.json';
import thetherContractJSON from './contracts/ThetherErc20Contract.json';
import {AbiItem} from "web3-utils";
import { Contract } from 'web3-eth-contract';
import {CURRENT_LATEST, ORBS_REWARDS_CONTRACT_ADDRESS, THETHER_CONTRACT_ADDRESS} from "./config";
import {logFunction} from "./utils/utils";
import { useNumber } from "react-hanger";

function App() {
  const hasEthereum = !!(window as any).ethereum;
  const latestBlockNumber = useNumber(CURRENT_LATEST);

  useEffect(() => {
    async function tryToConnect() {
      if (hasEthereum) {
        try {
          await (window as any).ethereum.enable();
          console.log('Enabled !');
        } catch (e) {
          logFunction(`Error when eneabling : ${e}`)
        }
      }
    }

    tryToConnect();
  }, [hasEthereum]);

  const web3 = useMemo(() => {
    if (!hasEthereum) {
      return null;
    }

    const web3Instance = new Web3((window as any).ethereum as any);

    return web3Instance;
  }, [hasEthereum])

  const readLatestBlockFunc = useCallback(async () => {
    if (!web3) {
      return 0;
    }

    const latest = await web3.eth.getBlockNumber();
    latestBlockNumber.setValue(latest);
    return latest

  }, [web3, latestBlockNumber]);

  useEffect(() => {
    if (readLatestBlockFunc) {
      readLatestBlockFunc().then(latestBlock => console.log({ latestBlock })).catch(e => console.error(e));
    }
  }, [readLatestBlockFunc])

  const orbsRewardsDistributionContract = useMemo<Contract|undefined>(() => {
    if (!hasEthereum || ! web3) {
      return undefined;
    }

    const distributionContract = new web3.eth.Contract(
      orbsRewardsDistributionContractJSON.abi as AbiItem[],
      ORBS_REWARDS_CONTRACT_ADDRESS
    );

    return distributionContract;

  }, [hasEthereum, web3]);
  const erc20Contract = useMemo<Contract|undefined>(() => {
    if (!hasEthereum || ! web3) {
      return undefined;
    }

    const distributionContract = new web3.eth.Contract(
      thetherContractJSON.abi as AbiItem[],
      THETHER_CONTRACT_ADDRESS
    );

    return distributionContract;

  }, [hasEthereum, web3]);

  return (
    <div className="App">
      <header className="App-header">
        <MainPage latestBlockNumber={latestBlockNumber.value} hasEthereum={hasEthereum} distributionContract={orbsRewardsDistributionContract} ercContract={erc20Contract}/>
      </header>
    </div>
  );
}

export default App;
