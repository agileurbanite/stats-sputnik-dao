import {Meteor} from "meteor/meteor";
import React, {useEffect, useState} from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {useTracker} from "meteor/react-meteor-data";
import {useGlobalMutation, useGlobalState} from '../../utils/container'
import {Decimal} from 'decimal.js';
import {Card, Box, CardContent, Container, Divider, Grid, makeStyles, Typography, Link, Chip, Button, Toolbar} from "@material-ui/core";
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

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
      '& .MuiChip-root': {
        borderRadius: 8,
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
      minHeight: 160,
    },
    daoCardHeader:{
      fontWeight: [700]
    },
    table: {
      minWidth: 650,
    },
    container: {
      marginBottom: 20,
    },
    clearButton: {
      textTransform: "none",
      fontWeight: "bold",
    },
    gridFilterPanel: {
      width: 'fit-content',
      '& hr': {
        margin: theme.spacing(0, 0.5),
      },
    },
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
    {field: 'id', headerName: 'ID', hide: true, width: 80},
    {
      field: 'daoName',
      headerName: 'Name',
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
    {
      field: 'usdAmount',
      headerName: 'Value(USD)',
      width: 140,
      type: 'number',
      valueFormatter: params => `$${params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      sortable: false
    },
    {field: 'proposals', headerName: 'Proposals', type: 'number', width: 140},
    {field: 'progress', headerName: 'In Progress', type: 'number', width: 150},
    {field: 'successful', headerName: 'Successful', type: 'number', width: 150},
    {field: 'failed', headerName: 'Failed', type: 'number', width: 120},
    {field: 'expired', headerName: 'Expired', type: 'number', width: 125},
  ];

  const [stateColumns, setColSettings] = React.useState(columns);

  const hideColumn = (event) => {
    const tempColumns = stateColumns.map(column =>
        column.field === event.target.id
            ? { ...column, hide: !event.target.checked }
            : column
    );
    setColSettings(tempColumns);
  }


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
        usdAmount:  new Decimal(nearPrice[0].near_price_data.current_price.usd).mul(new Decimal(item.amount / yoctoNEAR)).toFixed(0),
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

  const [filteredRows, setFilteredRows] = React.useState([]);
  const [filterRanges, setFilterRange] = React.useState({});


  const setDefFilterRanges = () => {
    let range = {};
    for(const col of columns){
      range[col.field] = [];
    }
    setFilterRange(range)
  }

  const getDefFilterRanges = () => {
    let range = {};
    for(const col of columns){
      range[col.field] = [];
    }
    return range;
  }

  const multipleFilter = (targetArray, filters) => {
    console.log(targetArray, filters);
    let filterKeys = Object.keys(filters);
    return targetArray.filter((eachObj) => {
      return filterKeys.every( (eachKey) => {
        if (!filters[eachKey].length) {
          return true;
        }
        return (parseInt(eachObj[eachKey])>=filters[eachKey][0] && parseInt(eachObj[eachKey])<=filters[eachKey][1]);
      });
    });
  };


  const getSliderRangeVal = () => {
    return filterRanges;
  }


  const getRanges = () =>{

  }

  const clearFilter = (event, id) => {
    const ranges = filterRanges;
    ranges[id] = [];
    setFilterRange(ranges);
    applyFilters(filterRanges);
  }

  function clearAllFilter(){

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

  const updateRange = (e, data) => {

  };

  const applyFilters = (filters) => {
    setFilterRange(filters);
    setFilteredRows(multipleFilter(rows, filters));
  }

  const getFilterRanges = () => {
    return filterRanges ? Object.fromEntries(
        Object.entries(filterRanges).filter(([key, value]) => value.length > 0)) : {};
  }

  const getFilteredRows = () => {
    return filteredRows.length>0 ? filteredRows: [...rows];
  }

  const GridFilterBtn = (props) => {
    return (
        <>
          {
            props.filterRanges ? Object.keys(props.filterRanges).map((filter,index) =>(
                <React.Fragment key={filter}>
                  <Box>
                    <Typography component="span" color="textSecondary" variant="body2">{columns.find(column=>column.field===filter).headerName}:</Typography>
                    <Chip
                        label={filterRanges[filter][0]+"-"+filterRanges[filter][1]}
                        onDelete={(e)=>clearFilter(e, filter)}
                    />
                  </Box>
                </React.Fragment>
            )): null
          }
        </>
    );
  }

  return (
    <div>
      <div className={classes.root}>
        <CssBaseline/>
        <Navbar
            updateRange={updateRange}
            clearFilter={clearFilter}
            handleSearchClick={handleSearchClick}
            multipleFilter={multipleFilter}
            hideColumn={hideColumn}
            applyFilters={applyFilters}
            columns={stateColumns}
            rangeVal = {getDefFilterRanges()}
            sliderVal = {getSliderRangeVal()}
            filteredRows = {getFilteredRows()}
            rows={[...rows]}/>
        <Container component="main" className={classes.main}>

          <Grid container
                spacing={3}
                justifyContent="center"
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
                spacing={1}
                justifyContent="space-between"
                className={classes.container}
          >
            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.daoCardHeader} variant="h3" component="h3" gutterBottom>
                    {!isLoadingDaoData ? daoData.length : null}
                  </Typography>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Number of DAOs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
             <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.daoCardHeader} variant="h3" component="h3">
                    {!isLoadingDaoData ? tvl.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    TVL (NEAR)
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
                  <Typography className={classes.daoCardHeader} variant="h3" component="h3" gutterBottom>
                    {countUnique(allAccounts)}
                  </Typography>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Number of account interactions
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary">

                  </Typography>
                </CardContent>
              </Card>
            </Grid>
              <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.daoCardHeader} variant="h3" component="h3">
                    {txActions.length}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    Total transactions
                  </Typography>

                  <Typography variant="h5" component="h5" color="textSecondary">

                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={2} align="center">
              <Card className={classes.daoCard}>
                <CardContent>
                  <Typography className={classes.daoCardHeader} variant="h3" component="h3">
                    {!isLoadingAllDeposits ? allDeposits.reduce((a, v) => a = a + (v.args.deposit / yoctoNEAR), 0).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                  </Typography>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Total Payout
                  </Typography>
                  <Typography variant="h5" component="h5" color="textSecondary" gutterBottom>
                    {!isLoadingAllDeposits ? '$' + new Decimal(nearPrice[0].near_price_data.current_price.usd).mul(allDeposits.reduce((a, v) => a = a + (v.args.deposit / yoctoNEAR), 0)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
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
            <Grid item item xs={12} md={12}>
              <Box display="flex" justifyContent="flex-start">
                {
                  Object.keys(getFilterRanges()).length ?
                        <Grid container alignItems="center" className={classes.gridFilterPanel}>
                          <Button color="primary" className={classes.clearButton}>X Clear All</Button>
                          <Divider orientation="vertical" flexItem />
                          <GridFilterBtn filterRanges={getFilterRanges()} />
                        </Grid>
                  : null

                }
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              {!isLoadingDaoData && !isLoadingNearPrice ?
                <div>
                  <DataGrid
                            rows={getFilteredRows()}
                            autoHeight={true}
                            columns={stateColumns}
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
