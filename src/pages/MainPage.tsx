import React, {useCallback} from 'react';
import Button from '@material-ui/core/Button';
import { Grid, Typography } from '@material-ui/core';
import {Contract} from "web3-eth-contract";

interface IProps {
  hasEthereum?: any;
  distributionContract?: Contract;
}

function MainPage(props: IProps) {
  const { hasEthereum, distributionContract } = props;

  const ORBS_TDE_ETHEREUM_BLOCK = 7439168;

  const readRewardsDistributionsHistory = useCallback(async () => {
    console.log('Called')
    const options = {
      fromBlock: ORBS_TDE_ETHEREUM_BLOCK,
      toBlock: 'latest',
      filter: { recipient: '0xC5e624d6824e626a6f14457810E794E4603CFee2' },
    };

    if (!distributionContract) {
      console.error('No rewards distribution contract');
      return;
    }

    console.log('Reading');

    const events = await distributionContract.getPastEvents('RewardDistributed', options);

    const readRewards = events.map(log => {
      return {
        distributionEvent: log.returnValues.distributionEvent as string,
        amount: BigInt(log.returnValues.amount),
        transactionHash: log.transactionHash,
      };
    });

    console.log(readRewards);
    return readRewards;
  }, [distributionContract]);

  if (!hasEthereum) {
    return <div>
      No ethereum provider
    </div>
  }

  return (
    <div>
      <Grid container direction={'column'} spacing={2}>
        <Grid item>
          <Typography variant={'h3'}>
            Events reading tests
          </Typography>
        </Grid>
        <Grid item>
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} >Read older events - ERC 20 contract</Button>
        </Grid>

        <Grid item>
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} onClick={readRewardsDistributionsHistory}>Read older events - Orbs contract</Button>
        </Grid>
      </Grid>
    </div>
);
}

export default MainPage;
