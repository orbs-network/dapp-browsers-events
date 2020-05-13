import React, {useCallback, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress, Grid, Input, Slider, Typography} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {Contract} from "web3-eth-contract";
import {logFunction} from "../utils/utils";
import { useBoolean, useStateful, useNumber } from 'react-hanger';
import TextField from '@material-ui/core/TextField';
import {CURRENT_LATEST, ORBS_TDE_ETHEREUM_BLOCK} from "../config";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      color: 'white',
      '& .MuiInputBase-input' : {
        textAlign: 'center',
      }
    },
  }),
);

interface IProps {
  latestBlockNumber: number;
  hasEthereum?: any;
  distributionContract?: Contract;
  ercContract?: Contract;
}

function MainPage(props: IProps) {
  const classes = useStyles();
  const { latestBlockNumber, hasEthereum, distributionContract, ercContract } = props;
  const lowBlock = useNumber(ORBS_TDE_ETHEREUM_BLOCK);
  const highBlock = useStateful<number>(latestBlockNumber);
  const orbsContractInteractionActive = useBoolean(false);
  const orbsContractInteractionHasError = useBoolean(false);
  const orbsContractInteractionMessage = useStateful('');
  const orbsContractInteractionError = useStateful('');

  const ercContractInteractionActive = useBoolean(false);
  const ercContractInteractionHasError = useBoolean(false);
  const ercContractInteractionMessage = useStateful('');
  const ercContractInteractionError = useStateful('');

  useEffect(() => {
    highBlock.setValue(latestBlockNumber);
  }, [latestBlockNumber])
  const readRewardsDistributionsHistory = useCallback(async () => {
    // logFunction('Called')
    const options = {
      fromBlock: lowBlock.value,
      toBlock: highBlock.value,
      // toBlock: 'latest',
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

      // logFunction('Got rewards' , readRewards.length);
      // orbsContractInteractionMessage.setValue(`Got ${JSON.stringify(readRewards)}`)
      orbsContractInteractionMessage.setValue(`Got ${readRewards.length} ORBS rewards events`);
      return readRewards;
    } catch (e) {
      // logFunction('error', e);
      orbsContractInteractionHasError.setTrue();
      orbsContractInteractionError.setValue(e.message);
      return [];
    } finally {
      orbsContractInteractionActive.setFalse();
    }
  }, [distributionContract, orbsContractInteractionActive, lowBlock, highBlock]);


  const readErc20Events = useCallback(async () => {
    // logFunction('Called erc')

    if (!ercContract) {
      logFunction('No erc contract');
      return;
    }

    // Reset state
    ercContractInteractionActive.setTrue();
    ercContractInteractionHasError.setFalse();
    ercContractInteractionMessage.setValue('');
    ercContractInteractionError.setValue('');

    const options = {
      fromBlock: lowBlock.value,
      toBlock: highBlock.value,
      // toBlock: 'latest',
      // filter: { recipient: '0xC5e624d6824e626a6f14457810E794E4603CFee2' },
    };

    try {
      const events = await ercContract.getPastEvents('Transfer', options);

      // const readRewards = events.map(log => {
      //   return {
      //     distributionEvent: log.returnValues.distributionEvent as string,
      //     amount: BigInt(log.returnValues.amount),
      //     transactionHash: log.transactionHash,
      //   };
      // });

      // logFunction('Got rewards' , readRewards.length);
      // ercContractInteractionMessage.setValue(JSON.stringify(events.slice(0, 2)))
      ercContractInteractionMessage.setValue(`Got ${events.length} erc20 Transfer events`)
      return [];
    } catch (e) {
      // logFunction('error', e);
      ercContractInteractionHasError.setTrue();
      ercContractInteractionError.setValue(e.message);
      return [];
    } finally {
      ercContractInteractionActive.setFalse();
    }
  }, [distributionContract, ercContractInteractionActive, lowBlock, highBlock]);

  if (!hasEthereum) {
    return <div>
      No ethereum provider
    </div>
  }

  const blocksRangeSize = highBlock.value - lowBlock.value;

  return (
    <div style={{ margin: '0.5em'}}>
      <Grid container direction={'column'} spacing={2}>
        {/* Titles */}
        <Grid item>
          <Typography variant={'h3'}>
            Events reading tests
          </Typography>
          <Typography variant={'h4'}>
            {lowBlock.value.toLocaleString()} - {highBlock.value.toLocaleString()}
          </Typography>
          <Typography variant={'h5'}>
            ({blocksRangeSize.toLocaleString()} {blocksRangeSize === 1 ? 'block' : 'blocks' })
          </Typography>
        </Grid>

         {/*Inputs - manual*/}
        <Grid item container justify={'center'} alignItems={'center'}>
          <Grid item>
            <Typography variant={'body1'}>
              Low block
            </Typography>
            <Input color={'primary'} type={'number'} value={lowBlock.value} onChange={e => lowBlock.setValue(parseInt(e.target.value))} inputProps={{ 'aria-label': 'description' }} className={classes.input} />
          </Grid>

          <Grid item>
            <Typography variant={'body1'}>
              High block
            </Typography>
            <Input color={'primary'} type={'number'} value={highBlock.value} onChange={e => highBlock.setValue(parseInt(e.target.value))} inputProps={{ 'aria-label': 'description' }} className={classes.input} />
          </Grid>
        </Grid>

        {/* Inputs - Slider */}
        <Grid item container justify={'center'} alignItems={'center'} direction={'column'}>
          <Grid item>
            <Typography variant={'body1'}>
              Blocks range
            </Typography>
          </Grid>

          <Grid item >
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(lowBlock.value)}>0</Button>
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(highBlock.value + 1)}>+1</Button>
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(highBlock.value + 10)}>+10</Button>
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(highBlock.value + 1000)}>+1000</Button>
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(highBlock.value + 10_000)}>+10,000</Button>
            <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => highBlock.setValue(highBlock.value + 100_000)}>+100,000</Button>
          </Grid>

          <Grid item style={{ width: 300 }}>
            <Slider style={{ width: '100%' }} value={[lowBlock.value, highBlock.value]} onChange={((event, value) => {
              const values = value as number[];
              lowBlock.setValue(values[0]);
              highBlock.setValue(values[1]);
            })}
                    min={ORBS_TDE_ETHEREUM_BLOCK}
                    max={latestBlockNumber}
                    valueLabelDisplay={'auto'}
            />

          </Grid>
        </Grid>

        {/* Erc 20 contract*/}
        <Grid item>
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} onClick={readErc20Events}>Read past events - Thether</Button>
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
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} onClick={readRewardsDistributionsHistory}>Read past events - Orbs rewards</Button>
        </Grid>
        <Grid item>
          {orbsContractInteractionActive.value && <CircularProgress />}
        </Grid>
        <Grid item>
          {(!orbsContractInteractionActive.value) && (<Typography>{orbsContractInteractionMessage.value}</Typography>)}
          {(!orbsContractInteractionActive.value && orbsContractInteractionHasError.value) && (<Typography color={'error'}>{orbsContractInteractionError.value}</Typography>)}
        </Grid>
        Version 0.2.9
      </Grid>
    </div>
);
}

export default MainPage;
