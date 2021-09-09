import React, {useEffect, useState} from "react";
import {useGlobalState} from "../../utils/container";
import {Box, Button, Divider, Drawer, IconButton, Slider, TextField, Typography} from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import ToolBar from '@material-ui/core/ToolBar';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: 200,
        },
    },
    drawerContainer: {
        width:340,
        height: "calc(100vh - 64px)",
        overflow: "auto",
    },
    dialogTitle: {
        margin: 0,
        padding: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        color: theme.palette.grey[500],
    },
    clearButton: {
        textTransform: "none",
        fontWeight: "bold",
    },
    filterPanel: {
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
    },
    panelToolbar: {
        position: "fixed",
        bottom: "0",
    },
    toolbarButtons:{
        display: "flex",
        alignItems: "space-between",
    }
}));

const ShowCountContext = React.createContext([]);
const ShowCountProvider = ({children}) => {
    const [showCount, setCount] = useState(0);

    const updateCount = (newValue) => {
        setCount(newValue);
    }

    return (
        <ShowCountContext.Provider value={[showCount, updateCount]}>
            {children}
        </ShowCountContext.Provider>
    )
}

export default function FilterPanel(props) {
    const classes = useStyles();
    const stateCtx = useGlobalState();
    const [state, setState] = useState(
        {
            filterOpen: stateCtx.config.filterOpen,
        });

    const handlePanelOpen = () =>
        setState((prevState) => ({...prevState, filterOpen: !prevState.filterOpen}));
    const handlePanelClose = () =>
        setState((prevState) => ({...prevState, filterOpen: false}));

    let rows = [...props.rows];
    const columns = [...props.columns.filter(col=>(!col.hide && col.field !== 'daoName'))];

    function getRange(arr, field){
        return getMinMax([...arr].map(item=> parseInt(item[field].toString().replace(/,/g, ''))));
    }

    function getMinMax(arr){
        return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
    }

    function getStep(range){
        const [min, max] = range;
        const stepSize = Math.pow(10,Math.floor(Math.log10(max-min)))/4;
        return  Math.floor(stepSize);
    }

    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
    }

    function filter(arr, field ,range){
        return [...arr].filter(row=>parseInt(row[field].toString().replace(',',''))>=range[0] && parseInt(row[field].toString().replace(/,/g, ''))<=range[1]);
    }

    function valuetext(value) {
        return `${kFormatter(value)}`;
    }


    let tempRows = [...props.rows];
    let filterRange = [];


    const setFilterRange = () => {
        let range = {};
        for(const col of columns){
            range[col.field] = [];
        }
        filterRange = range;
    }

    const FilterSlider = (props)=>{
        const rangeVal = [...props.rangeVal];
        const [sliderVal, setSliderVal] = useState(props.rangeVal);
        const [showCount, updateCount] = React.useContext(ShowCountContext);

        useEffect(()=> {
            updateCount(tempRows.length);
        }, [showCount]);

        const updateFilter = () => {
            tempRows = multipleFilter(rows, filterRange);
            updateCount(tempRows.length);
        }

        const multipleFilter = (targetArray, filters) => {
            let filterKeys = Object.keys(filters);
            return targetArray.filter((eachObj) => {
                return filterKeys.every( (eachKey) => {
                    if (!filters[eachKey].length) {
                        return true;
                    }
                    return (eachObj[eachKey]>=filters[eachKey][0] && eachObj[eachKey]<=filters[eachKey][1]);
                });
            });
        };

        const updateRange = (e, data) => {
            filterRange[props.id] = data;
            setSliderVal(data);
            updateFilter();
           /*const update = () => {
               props.updateRange(props.id, data);
           };
           update();*/
        };
        const updateMinValue = (event) => {
            const newVal = [parseInt(event.target.value), rangeVal[1]] || 0;
            filterRange[props.id] = newVal;
            setSliderVal(newVal);
            updateFilter();
            /*const update = () => {
                props.updateRange(props.id, newVal);
            };
            update();*/
        }
        const updateMaxValue = (event) => {
            const newVal = [ rangeVal[0], parseInt(event.target.value)] || 0;
            filterRange[props.id] = newVal;
            setSliderVal(newVal);
            updateFilter();
            /*const update = () => {
                props.updateRange(props.id, newVal);
            };
            update();*/
        }

        return (
            <>
                <Box component="div" display="flex">
                    <Slider
                        value={sliderVal}
                        onChange={updateRange}
                        valueLabelDisplay="auto"
                        max={rangeVal[1]}
                        step={getStep(rangeVal)}
                        marks
                        aria-labelledby="range-slider"
                        valueLabelFormat={valuetext}
                        getAriaValueText={valuetext}
                    />
                </Box>
                <Box component="div" display="flex" justifyContent="space-between">
                    <TextField  InputProps={{
                        inputProps: {
                            step: getStep(rangeVal)} }} id={props.id+"From"} variant="filled" label="From"
                                value={sliderVal[0]}  type="number" onChange={updateMinValue}/>
                    <TextField  InputProps={{ inputProps: {
                            step: getStep(rangeVal)} }}  id={props.id+"To"} variant="filled" label="To"
                                value={sliderVal[1]} type="number" onChange={updateMaxValue} />
                </Box>
            </>
        );
    }

    const ColumnsFilter = (props) => {
        setFilterRange();
        return (
            props?.columns ? props.columns.map( (item, index) => (
                <React.Fragment key={item.field}>
                    <Box className={classes.root} index={index}>
                        <Box component="div" display="flex" alignItems="baseline" justifyContent="space-between">
                            <Typography variant="body2"  component="span" color="textSecondary">{item.headerName}</Typography>
                            <Button color="primary" className={classes.clearButton} onClick={(e)=>props.clearFilter(item.field)}>Clear</Button>
                        </Box>
                        <FilterSlider {...props} rangeVal={getRange(rows, item.field)} id={item.field} updateRange={props.updateRange}/>
                     </Box>
                </React.Fragment>
            )) : null
       );
    }

    const PanelToolBar = (props) => {
        const [showCount] = React.useContext(ShowCountContext);

        useEffect(()=> {
//            console.log('effect on count triggered');
        }, [showCount]);

        const applyFilters = () => {

        }

        return (
            <>
                <Box display="flex" alignItems="space-between" className={classes.toolbarButtons} >
                    <Button color="primary" className={classes.clearButton} onChange={(event) => {
                        applyFilters();
                    }}>Clear All</Button>
                    <Button variant="contained" color="primary" onChange={(event) => {
                        applyFilters();
                    }}>{`Show ${showCount} items`}</Button>
                </Box>
            </>
        );
    }


    const FilterDialog = (props) => {
      return (
          <>
              <Box className={classes.dialogTitle}>
                  <Typography style={{ fontWeight: 600 }} variant="h6" component="h6">Filter</Typography>
                  <IconButton aria-label="close" className={classes.closeButton} onClick={handlePanelClose}>
                      <CloseIcon />
                  </IconButton>
              </Box>
              <Divider/>
              <ColumnsFilter columns={columns}  rangeVal={props.rangeVal} updateRange={props.updateRange}/>
          </>
      );
    }

    return (
        <ShowCountProvider>
            <div>
                <IconButton {...{
                    "aria-label": "menu",
                    "aria-haspopup": "true",
                    onClick: handlePanelOpen,
                }}>
                    <FilterListIcon />
                </IconButton>
                <Drawer
                    {...{
                        anchor: "right",
                        open: state.filterOpen,
                        onClose: handlePanelClose,
                    }}>
                    <div className={classes.filterPanel}>
                        <div className={classes.drawerContainer}>
                            <FilterDialog {...props}/>
                        </div>
                        <div className={classes.panelToolbar}>
                            <PanelToolBar {...props} />
                        </div>
                    </div>
                </Drawer>
            </div>
        </ShowCountProvider>
    );
}