import {Meteor} from "meteor/meteor";
import React, {useEffect, useState} from "react";
import clsx from 'clsx';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {useTracker} from "meteor/react-meteor-data";
import {useGlobalMutation, useGlobalState} from '../../utils/container'
import {Decimal} from 'decimal.js';
import {Card, CardContent, Container, Divider, Grid, makeStyles, Typography, Link} from "@material-ui/core";
import {DataGrid, GridToolbarContainer, GridToolbarExport,} from '@material-ui/data-grid';


import {blue} from '@material-ui/core/colors';
import CssBaseline from "@material-ui/core/CssBaseline";
import {DaoData, NearPrice, TxActions} from "../../api/data";


const yoctoNEAR = 1000000000000000000000000;

const useDaoData = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("DaoData");
    const daoData = DaoData.find().fetch();

    const meteorStatus = Meteor.status();

    return {
      daoData: daoData,
      isLoadingDaoData: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useNearPrice = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("NearPrice");
    const nearPrice = NearPrice.find().fetch();
    const meteorStatus = Meteor.status();

    return {
      nearPrice: nearPrice,
      isLoadingNearPrice: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useAllDeposits = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("TxActions");
    const allDeposits = TxActions.find({"action_kind": "TRANSFER"}).fetch();

    const meteorStatus = Meteor.status();

    return {
      allDeposits: allDeposits,
      isLoadingAllDeposits: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useTxActions = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("TxActions");
    const txActions = TxActions.find({}).fetch();

    const meteorStatus = Meteor.status();

    return {
      txActions: txActions,
      isLoadingTxActions: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const Index = () => {
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const {daoData, isLoadingDaoData} = useDaoData();
  const {nearPrice, isLoadingNearPrice} = useNearPrice();
  const {allDeposits, isLoadingAllDeposits} = useAllDeposits();
  const {txActions, isLoadingTxActions} = useTxActions();


  console.log('stateCtx', stateCtx);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
    },
    main: {
      marginTop: theme.spacing(12),
      marginBottom: theme.spacing(2),
    },
    card: {
      width: '100%',
    },
    input: {
      width: '100%',
    },
    buttonProgress: {
      color: blue[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
    formControl: {
      margin: theme.spacing(1),
      width: '100%',
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 0,
    },
    daoCard: {
      borderRadius: 15,
      maxWidth: 250,
      minHeight: 250,
    },
    table: {
      minWidth: 650,
    },
    container: {
      marginBottom: 20,
    }

  }));
  const classes = useStyles();

  const handleSearchClick = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };


  const handleDaoClick = (value) => {
    window.open("https://sputnik.fund/#/" + value, '_blank').focus();
  }


  const columns = [
    {field: 'id', headerName: 'ID', hide: true},
    {
      field: 'daoName',
      headerName: 'DAO',
      width: 250,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <Link
          component="button"
          variant="body2"
          color="inherit"
          onClick={() => handleDaoClick(params.value)}
        >
          {params.value}
        </Link>
      )
    },
    {field: 'nearAmount', headerName: 'Ⓝ Value', width: 140, type: 'number'},
    {field: 'usdAmount', headerName: '$ Value', width: 140, type: 'number', sortable: false},
    {field: 'proposals', headerName: 'Proposals', type: 'number', width: 140},
    {field: 'progress', headerName: 'In Progress', type: 'number', width: 150},
    {field: 'successful', headerName: 'Successful', type: 'number', width: 150},
    {field: 'failed', headerName: 'Failed', type: 'number', width: 120},
    {field: 'expired', headerName: 'Expired', type: 'number', width: 125},
  ];

  let tvl = 0;
  let rows = [];
  if (!isLoadingDaoData && daoData && !isLoadingNearPrice && nearPrice) {
    let id = 0;
    daoData.map((item, key) => {
      tvl = new Decimal(item.amount / yoctoNEAR).plus(tvl);
      let successful = 0;
      let failed = 0;
      let progress = 0;
      let expired = 0;
      if (item.proposals) {
        item.proposals.map((i, k) => {
          if (i.status === 'Success') {
            successful = successful + 1;
          }
          if (i.status === 'Fail') {
            failed = failed + 1;
          }

          if (i.status === 'Vote' && i.vote_period_end > (new Date()).getTime() * 1000 * 1000) {
            progress = progress + 1;
          }

          if (i.status === 'Vote' && i.vote_period_end < (new Date()).getTime() * 1000 * 1000) {
            expired = expired + 1;
          }

          //console.log(i);
        })
      }


      const row = {
        id: id,
        daoName: item.daoName,
        nearAmount: new Decimal(item.amount / yoctoNEAR).toFixed(0),
        usdAmount: "$" + new Decimal(nearPrice[0].near_price_data.current_price.usd).mul(new Decimal(item.amount / yoctoNEAR)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        proposals: item.proposals ? item.proposals.length : 0,
        progress: progress,
        successful: successful,
        failed: failed,
        expired: expired,
      };
      id = id + 1;
      rows.push(row);
    });
  }


  function ExportToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport/>
      </GridToolbarContainer>
    );
  }

  function countUnique(iterable) {
    return new Set(iterable).size;
  }

  let allAccounts = []
  txActions.map((item, key) => {
    allAccounts.push(item.signer_account_id)
  });


  function filterNearValue(value){
    console.log('filterNearValue', value);
  }


  return (
    <div>
      <div className={classes.root}>
        <CssBaseline/>
        <Navbar filterNearValue={filterNearValue} handleSearchClick={handleSearchClick}/>
        <Container component="main" className={classes.main}>

          <Grid container
                spacing={3}
                justify="center"
                className={classes.container}
          >
            <Grid item xs={12} sm={6} md={6}>
              <Typography variant="h4" component="h5" gutterBottom>
                Sputnik DAO v1 Statistics <Divider/>under development
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Typography color="textSecondary" gutterBottom>
                This website is in beta and does not provide an investment or other advice.<br/> Please do your own
                research.
              </Typography>
            </Grid>
          </Grid>

          <Grid container
                spacing={3}
                justify="center"
                className={classes.container}
          >
            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Number of DAOs
                  </Typography>
                  <Typography variant="h3" component="h3" gutterBottom>
                    {!isLoadingDaoData ? daoData.length : null}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    TVL
                  </Typography>
                  <Typography variant="h5" component="h5">
                    {!isLoadingDaoData ? tvl.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Ⓝ' : null}
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary">
                    {!isLoadingNearPrice && !isLoadingDaoData ? '$' + new Decimal(nearPrice[0].near_price_data.current_price.usd).mul(tvl).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Number of account interactions
                  </Typography>
                  <Typography variant="h3" component="h3" gutterBottom>
                    {countUnique(allAccounts)}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    Total transactions
                  </Typography>
                  <Typography variant="h4" component="h4">
                    {txActions.length}
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary">

                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Total Payout
                  </Typography>
                  <Typography variant="h5" component="h5">
                    {!isLoadingAllDeposits ? allDeposits.reduce((a, v) => a = a + (v.args.deposit / yoctoNEAR), 0).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Ⓝ' : null}
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary" gutterBottom>
                    {!isLoadingAllDeposits ? '$' + new Decimal(nearPrice[0].near_price_data.current_price.usd).mul(allDeposits.reduce((a, v) => a = a + (v.args.deposit / yoctoNEAR), 0)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary">
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/*}
            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Coming soon...
                  </Typography>
                  <Typography variant="h4" component="h4">
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary" gutterBottom>
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary">
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            */}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              {!isLoadingDaoData && !isLoadingNearPrice ?
                <div>
                  <DataGrid rows={rows}
                            autoHeight={true}
                            columns={columns}
                            pageSize={100}
                            components={{
                              Toolbar: ExportToolbar,
                            }}/>
                </div>
                : null}
            </Grid>
          </Grid>
        </Container>
        <Footer/>
      </div>
    </div>
  );
};

export default Index;
