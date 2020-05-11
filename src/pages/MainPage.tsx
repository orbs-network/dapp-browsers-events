import React, {useCallback} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress, Grid, Typography} from '@material-ui/core';
import {Contract} from "web3-eth-contract";
import {logFunction} from "../utils/utils";
import { useBoolean, useStateful, useNumber } from 'react-hanger';


interface IProps {
  hasEthereum?: any;
  distributionContract?: Contract;
}

function MainPage(props: IProps) {
  const { hasEthereum, distributionContract } = props;
  const ORBS_TDE_ETHEREUM_BLOCK = 7439168;
  const lowBlock = useNumber(ORBS_TDE_ETHEREUM_BLOCK);
  const highBlock = useNumber(ORBS_TDE_ETHEREUM_BLOCK + 1);
  const orbsContractInteractionActive = useBoolean(false);
  const orbsContractInteractionHasError = useBoolean(false);
  const orbsContractInteractionMessage = useStateful('');
  const orbsContractInteractionError = useStateful('');

  const ercContractInteractionActive = useBoolean(false);
  const ercContractInteractionHasError = useBoolean(false);
  const ercContractInteractionMessage = useStateful('');
  const ercContractInteractionError = useStateful('');

  const readRewardsDistributionsHistory = useCallback(async () => {
    // logFunction('Called')
    const options = {
      fromBlock: ORBS_TDE_ETHEREUM_BLOCK,
      toBlock: 'latest',
      filter: { recipient: '0xC5e624d6824e626a6f14457810E794E4603CFee2' },
    };

    if (!distributionContract) {
      logFunction('No rewards distribution contract');
      return;
    }

    // logFunction('Reading');

    // Reset state
    orbsContractInteractionActive.setTrue();
    orbsContractInteractionHasError.setFalse();
    orbsContractInteractionMessage.setValue('');
    orbsContractInteractionError.setValue('');

    try {
      const events = await distributionContract.getPastEvents('RewardDistributed', options);

      const readRewards = events.map(log => {
        return {
          distributionEvent: log.returnValues.distributionEvent as string,
          amount: log.returnValues.amount.toString(),
          transactionHash: log.transactionHash,
        };
      });

      logFunction('Got rewards' , readRewards.length);
      orbsContractInteractionMessage.setValue(`Got ${JSON.stringify(readRewards)}`)
      return readRewards;
    } catch (e) {
      // logFunction('error', e);
      orbsContractInteractionHasError.setTrue();
      orbsContractInteractionError.setValue(e.message);
      return [];
    } finally {
      orbsContractInteractionActive.setFalse();
    }
  }, [distributionContract, orbsContractInteractionActive]);



  const readErc20Events = useCallback(async () => {
    // logFunction('Called erc')

    if (!distributionContract) {
      logFunction('No erc contract');
      return;
    }

    // Reset state
    ercContractInteractionActive.setTrue();
    ercContractInteractionHasError.setFalse();
    ercContractInteractionMessage.setValue('');
    ercContractInteractionError.setValue('');

    try {
      // const events = await distributionContract.getPastEvents('RewardDistributed', options);

      // const readRewards = events.map(log => {
      //   return {
      //     distributionEvent: log.returnValues.distributionEvent as string,
      //     amount: BigInt(log.returnValues.amount),
      //     transactionHash: log.transactionHash,
      //   };
      // });

      // logFunction('Got rewards' , readRewards.length);
      ercContractInteractionMessage.setValue('Done')
      return [];
    } catch (e) {
      // logFunction('error', e);
      ercContractInteractionHasError.setTrue();
      ercContractInteractionMessage.setValue(e.message);
      return [];
    } finally {
      ercContractInteractionActive.setFalse();
    }
  }, [distributionContract, ercContractInteractionActive]);

  if (!hasEthereum) {
    return <div>
      No ethereum provider
    </div>
  }

  return (
    <div>
      <Grid container direction={'column'} spacing={2}>
        {/* Titles */}
        <Grid item>
          <Typography variant={'h3'}>
            Events reading tests
          </Typography>
          <Typography variant={'h4'}>
            {lowBlock.value} - {highBlock.value}
          </Typography>
        </Grid>

        {/* Erc 20 contract*/}
        <Grid item>
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} onClick={readErc20Events}>Read older events - ERC 20 contract</Button>
        </Grid>
        <Grid item>
        {ercContractInteractionActive.value && <CircularProgress />}
        </Grid>
        <Grid item>
          {(!ercContractInteractionActive.value) && (<Typography>{ercContractInteractionMessage.value}</Typography>)}
          {(!ercContractInteractionActive.value && ercContractInteractionHasError.value) && (<Typography color={'error'}>{ercContractInteractionError.value}</Typography>)}
        </Grid>

        {/* Orbs Contract */}
        <Grid item>
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} onClick={readRewardsDistributionsHistory}>Read older events - Orbs contract</Button>
        </Grid>
        <Grid item>
          {orbsContractInteractionActive.value && <CircularProgress />}
        </Grid>
        <Grid item>
          {(!orbsContractInteractionActive.value) && (<Typography>{orbsContractInteractionMessage.value}</Typography>)}
          {(!orbsContractInteractionActive.value && orbsContractInteractionHasError.value) && (<Typography color={'error'}>{orbsContractInteractionError.value}</Typography>)}
        </Grid>
      </Grid>
    </div>
);
}

export default MainPage;
