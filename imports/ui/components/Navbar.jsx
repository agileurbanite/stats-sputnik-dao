import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Switch,
  Slider,
  Divider,
  Avatar,
  Chip,
  Box,
  TextField,
  InputBase
} from "@material-ui/core";
import {fade, makeStyles, withStyles } from '@material-ui/core/styles';
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import TuneIcon from '@material-ui/icons/Tune';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import CloseIcon from '@material-ui/icons/Close';
import React, {useState, useEffect} from "react";
import {useGlobalState, useGlobalMutation} from '../../utils/container'
import MuiDialogTitle from '@material-ui/core/DialogTitle';

const filterDrawer = {
  width: 240,
}
const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  header: {
    backgroundColor: "darkgrey",
    paddingRight: "79px",
    paddingLeft: "118px",
    borderBottom: "1px solid",
    boxShadow: "0",
    "@media (max-width: 900px)": {
      paddingLeft: 0,
    },
  },
  divider: {
    margin: "10px",
  },
  appBar: {
    boxShadow: "none",
    borderBottom: "1px solid #e0e0e0",
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  logo: {
    fontFamily: "Work Sans, sans-serif",
    fontWeight: 600,
    color: "#FFFEFE",
    textAlign: "left",
  },
  menuButton: {
    fontFamily: "Open Sans, sans-serif",
    fontWeight: 700,
    size: "18px",
    marginLeft: "38px",
  },
  navBarItems: {
    marginLeft: theme.spacing(1),
  },
  navBarText: {
    marginTop: theme.spacing(3),
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
  },
  drawerContainer: {
    width:340,
  },
  title: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  clearButton: {
    textTransform: "none",
    fontWeight: "bold",
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));


export default function Navbar(props) {
  console.log('props', props);
  const classes = useStyles();
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const [search, setSearch] = useState(null);

  const [state, setState] = useState(
      {
    mobileView: false,
    drawerOpen: false,
    filterOpen: stateCtx.config.filterOpen,
    darkMode:  stateCtx.config.darkMode === 'dark',
  });

  const handleDarkModeToggle = () => {
    //console.log(!state.darkMode);
    setState({...state, darkMode: !state.darkMode});
  };

  /*
  const handleSearchClick = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(search);
    }
  };
  */

  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  useEffect(() => {
    mutationCtx.updateConfig({
      darkMode: state.darkMode ? 'dark' : 'light',
    })
  }, [state.darkMode]);



  const {mobileView, drawerOpen, filterOpen} = state;

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 900
        ? setState((prevState) => ({...prevState, mobileView: true}))
        : setState((prevState) => ({...prevState, mobileView: false}));
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());
  }, []);


  const searchBox = (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon/>
      </div>
      <InputBase
        onKeyDown={props.handleSearchClick}
        onChange={handleSearchChange}
        value={search}
        placeholder="Search for…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{'aria-label': 'search'}}
      />
    </div>
  )

  const handleFilterOpen = () =>
      setState((prevState) => ({...prevState, filterOpen: !prevState.filterOpen}));
  const handleFilterClose = () =>
      setState((prevState) => ({...prevState, filterOpen: false}));

  const FilterBtn = (
      <IconButton {...{
        edge: "start",
        color: "inherit",
        "aria-label": "menu",
        "aria-haspopup": "true",
        onClick: handleFilterOpen,
      }}>
        <FilterListIcon />
      </IconButton>
  )


  const ColumnSettingsBtn = (
      <IconButton {...{
        edge: "start",
        color: "inherit",
        "aria-label": "menu",
        "aria-haspopup": "true",
        onClick: handleFilterOpen,
      }}>
        <TuneIcon />
      </IconButton>
  )

  const DarkSwitchBtn = (
      <IconButton {...{
        edge: "start",
        color: "inherit",
        "aria-label": "menu",
        "aria-haspopup": "true",
        onClick: handleDarkModeToggle,
      }}>
        {state.darkMode ? <Brightness2Icon />: <Brightness4Icon />}
      </IconButton>
  )

  const FiltersDialogTitle = (props) => {
    const { children, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
          <Typography variant="h6" component="h6">{children}</Typography>
          {onClose ? (
              <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                <CloseIcon />
              </IconButton>
          ) : null}
        </MuiDialogTitle>
    );
  };

  const displayDesktop = () => {
    return (
      <Toolbar className={classes.toolbar}>
        {nearLogo}
        <Divider orientation="vertical" flexItem/>
        {appLogo}
        {/*searchBox*/}
        <Divider className={classes.divider} orientation="vertical" flexItem />
        {DarkSwitchBtn}
        {FilterBtn}
        {ColumnSettingsBtn}
        {getMenuButtons(false)}
      </Toolbar>
    );
  };

  const displayMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({...prevState, drawerOpen: true}));
    const handleDrawerClose = () =>
      setState((prevState) => ({...prevState, drawerOpen: false}));


    return (
      <Toolbar>
        <IconButton
          {...{
            edge: "start",
            color: "inherit",
            "aria-label": "menu",
            "aria-haspopup": "true",
            onClick: handleDrawerOpen,
          }}
        >
          <MenuIcon/>
        </IconButton>

        <Drawer
          {...{
            anchor: "left",
            open: drawerOpen,
            onClose: handleDrawerClose,
          }}
        >
          <div className={classes.drawerContainer}>
            {nearLogo}
            <Divider/>
            {darkSwitch}
            <Divider/>
            {getMenuButtons(true)}
          </div>
        </Drawer>
        {getMenuButtons(true)}
        {searchBox}
      </Toolbar>
    );
  };


  const appLogo = (
    <>
      <Typography variant="h6" component="h1" className={classes.title}>
        Sputnik DAO v1 Stats
      </Typography>
    </>
  );

  const handleClearNear = ()=>{
    console.log('clear Near');
    return;
  }

  const [valueNear, setNearValue] = React.useState([20, 37]);

  function valuetext(value) {
    return `${value}`;
  }

  const handleChangeNear = (event, newValue) => {
    const {id, valueAsNumber} = event.target;
    let newVal = [...valueNear];
    if (id === 'nearFrom'){
      newVal[0] = valueAsNumber;
    } else {
      newVal[1] = valueAsNumber;
    }
    console.log(id, valueAsNumber, newVal, valueNear);
//    setNearValue(newValue);
  };

  const filterNear = (
    <Box className={classes.root}>
      <Box component="div" display="flex" alignItems="baseline" justifyContent="space-between">
        <Typography variant="body2"  component="span">Value (NEAR)</Typography>
        <Button color="primary" className={classes.clearButton} onClick={handleClearNear}>Clear</Button>
      </Box>
      <Box component="div" display="flex">
        <Slider
            value={valueNear}
            onChange={handleChangeNear}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={valuetext}
        />
      </Box>
      <Box component="div" display="flex" justifyContent="space-between">
        <TextField id="nearFrom" variant="filled" label="From" defaultValue={valueNear[0]}  type="number" onChange={handleChangeNear}/>
        <TextField id="nearTo" variant="filled" label="to" defaultValue={valueNear[1]} type="number" onChange={handleChangeNear} />
      </Box>
    </Box>
  );

  const filterDialog = (
      <>
        <FiltersDialogTitle id="customized-dialog-title" onClose={handleFilterClose}>
          Filter
        </FiltersDialogTitle>
        <Divider/>
        {filterNear}
        <Button onClick={() => props.filterNearValue('100')}>Click test</Button>
      </>
  );

  const darkSwitch = (
    <Switch
      checked={state.darkMode}
      onChange={handleDarkModeToggle}
      name="toggleDarkMode"
      color="primary"
      inputProps={{'aria-label': 'secondary checkbox'}}
    />
  );

  const exportDialog =() => {
    return (
        <>
        </>
    );
  };

  const nearLogo = (
    <img style={state.darkMode ? {filter: "brightness(0) invert(1)"} : null}
         height="30"
         src="https://gov.near.org/uploads/default/original/1X/7aa6fc28cbccdc2242717e8fe4c756829d90aaec.png"/>
  );

  const getMenuButtons = (isMobile) => {
      return (
        <>
        </>
      );
    };

  return (
    <>
      <AppBar boxShadow={0} color="default" className={classes.appBar}>
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
      <Drawer
              {...{
                anchor: "right",
                open: filterOpen,
                onClose: handleFilterClose,
              }}
      >
        <div className={classes.drawerContainer}>
          {filterDialog}
        </div>
      </Drawer>
    </>
  );
}
