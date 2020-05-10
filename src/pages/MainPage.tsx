import React from 'react';
import Button from '@material-ui/core/Button';
import { Grid, Typography } from '@material-ui/core';

interface IProps {
  ethereum?: any;
}

function MainPage(props: IProps) {
  const { ethereum } = props;

  if (!ethereum) {
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
          <Button style={{ color: '#ffffff', borderColor: '#ffffff' }} variant={"outlined"} >Read older events - Orbs contract</Button>
        </Grid>
      </Grid>
    </div>
);
}

export default MainPage;
