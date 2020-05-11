import React, {useEffect, useMemo} from 'react';
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import MainPage from './pages/MainPage';
import orbsRewardsDistributionContractJSON from './contracts/OrbsRewardsDistribution.json';
import {AbiItem} from "web3-utils";
import { Contract } from 'web3-eth-contract';
import {ORBS_REWARDS_CONTRACT_ADDRESS} from "./config";

function App() {
  const hasEthereum = !!(window as any).ethereum;

  useEffect(() => {
    async function tryToConnect() {
      if (hasEthereum) {
        try {
          await (window as any).ethereum.enable();
          console.log('Enabled !');
        } catch (e) {
          console.log(`Error when eneabling : ${e}`)
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

  return (
    <div className="App">
      <header className="App-header">
        <MainPage hasEthereum={hasEthereum} distributionContract={orbsRewardsDistributionContract}/>
      </header>
    </div>
  );
}

export default App;
