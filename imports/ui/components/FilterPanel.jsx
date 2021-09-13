import React, {useEffect, useState} from "react";
import {useGlobalState} from "../../utils/container";
import {Box, Button, Divider, Drawer, IconButton, Slider, TextField, Typography} from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";
import ToolBar from '@material-ui/core/ToolBar';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: 125,
        },
    },
    drawerContainer: {
        width:340,
        height: "calc(100vh - 64px)",
        overflowY: "auto",
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

    const updateCount = (countValue) => {
        setCount(countValue);
    }

    return (
        <ShowCountContext.Provider value={[showCount, updateCount]}>
            {children}
        </ShowCountContext.Provider>
    )
}

const SliderFilterContext = React.createContext([]);

const SliderFilterProvider = ({children}) => {
    const [showFilter, setFilter] = useState(0);

    const updateSliderFilter = (filterValue) => {
        setFilter(filterValue);
    }

    return (
        <SliderFilterContext.Provider value={[showFilter, updateSliderFilter]}>
            {children}
        </SliderFilterContext.Provider>
    )
}


export default function FilterPanel(props) {
    console.log('props', props);
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
        return getMinMax([...arr].map(item=> parseInt(item[field])));
    }

    function getMinMax(arr){
        return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
    }

/*
    function getStep(range){
        const [min, max] = range;
        const stepSize = Math.pow(10,Math.floor(Math.log10(max-min)))/4;
        return  Math.floor(stepSize);
    }
*/
    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
    }

    function valuetext(value) {
        return `${kFormatter(value)}`;
    }

    let filteredRows = [...props.filteredRows];
    let tempRows = [...props.filteredRows];
    let filterRange = [];


    const FilterSlider = (props)=>{
        console.log('FilterSlider', props);
        const [rangeMin, rangeMax] = [...props.rangeVal];
        const [sliderMin, sliderMax] = [...props.sliderVal];
        const [sliderVal, setSliderVal] = useState([sliderMin, sliderMax]);
        const [showCount, updateCount] = React.useContext(ShowCountContext);
        const [showFilter, updateSliderFilter] = React.useContext(SliderFilterContext);

        useEffect(()=> {
            updateCount(tempRows.length);
        }, [showCount]);

        useEffect(()=> {
            updateSliderFilter(sliderVal);
        }, [showFilter]);

        const handleChangeCommitted = (event, data) => {
            console.log('handleChangeCommitted', data);
            filterRange[props.id] = data;
            setSliderVal(data);
            updateFilter();
        };

        const updateFilter = () => {
            tempRows = props.multipleFilter(rows, filterRange);
            updateSliderFilter(sliderVal);
            updateCount(tempRows.length);
        }

        const updateSliderRange = (e, data) => {
            filterRange[props.id] = data;
            setSliderVal(data);
            updateFilter();
        };

        const updateMinValue = (event) => {
            const newVal = [parseInt(event.target.value), rangeMax];
            filterRange[props.id] = newVal;
            setSliderVal(newVal);
            updateFilter();
        }

        const updateMaxValue = (event) => {
            const newVal = [ rangeMin, parseInt(event.target.value)];
            filterRange[props.id] = newVal;
            setSliderVal(newVal);
            updateFilter();
        }

        return (
            <>
                <Box component="div" display="flex">
                    <Slider
                        key = {props.index}
                        value={showFilter}
                        onChange={updateSliderRange}
                        onChangeCommitted={handleChangeCommitted}
                        valueLabelDisplay="auto"
                        min={rangeMin}
                        max={rangeMax}
                        aria-labelledby="range-slider"
                        valueLabelFormat={valuetext}
                        getAriaValueText={valuetext}
                    />
                </Box>
                <Box component="div" display="flex" justifyContent="space-between">
                    <TextField  InputProps={{
                        inputProps: {
                            min: rangeMin,
                            max: rangeMax} }} id={props.id+"From"} variant="filled" label="From"
                                value={sliderVal[0]}  type="number" onChange={updateMinValue}/>
                    <TextField  InputProps={{ inputProps: {
                            min: rangeMin,
                            max: rangeMax } }}  id={props.id+"To"} variant="filled" label="To"
                                value={sliderVal[1]} type="number" onChange={updateMaxValue} />
                </Box>
            </>
        );
    }

    const ColumnsFilter = (props) => {
        console.log('props<<<', props);

        useEffect(()=> {
            filterRange = props.sliderVal;
        }, []);


        //setDefFilterRanges();
        return (
            (props?.columns.length>0) ? props.columns.map((item, index) => (
                <React.Fragment key={item.field}>
                    <SliderFilterProvider>
                        <Box className={classes.root}>
                            <Box component="div" display="flex" alignItems="baseline" justifyContent="space-between">
                                <Typography variant="body2"
                                            component="span"
                                            color="textSecondary">{item.headerName}</Typography>
                                <Button color="primary"
                                        className={classes.clearButton}
                                        onClick={(e)=>props.clearFilter(item.field)}>Clear</Button>
                            </Box>
                            <FilterSlider {...props} sliderVal={props.sliderVal[item.field]?.length ? props.sliderVal[item.field] :getRange(rows, item.field)} rangeVal={getRange(rows, item.field)} id={item.field} updateRange={props.updateRange} index={index}/>
                        </Box>
                    </SliderFilterProvider>
                </React.Fragment>
            )) : null
       );
    }

    const PanelToolBar = (props) => {
        const [showCount] = React.useContext(ShowCountContext);

        const clearAll = () => {
            //setDefFilterRanges();
        }

        return (
            <>
                <Box sx={{
                    display: "flex",
                    justifyContent:"center",
                    position: "absolute",
                    bottom: "0",
                    left: "50%",
                    transform: "translate(-50%, 0)"}}
                >
                    <Button className={classes.clearButton} sx={{m:1}} onChange={(event) => {
                        clearAll();
                    }}>Clear All</Button>
                    <Button variant="outlined" sx={{m:1}} onClick={(event) => {
                        props.applyFilters(filterRange);
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
              <ColumnsFilter columns={columns}  sliderVal={props.sliderVal} rangeVal={props.rangeVal} updateRange={props.updateRange} multipleFilter={props.multipleFilter}/>
          </>
      );
    }

    return (

            <ToolBar>
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
                            <ShowCountProvider>
                                <div className={classes.drawerContainer}>
                                    <FilterDialog {...props}/>
                                </div>
                                <div className={classes.root}>
                                    <PanelToolBar {...props} />
                                </div>
                            </ShowCountProvider>
                        </div>
                </Drawer>
            </ToolBar>
    );
}