import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Switch,
  Divider,
  InputBase,
} from "@material-ui/core";
import {alpha, makeStyles, withStyles } from '@material-ui/core/styles';
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from '@material-ui/icons/Search';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import React, {useState, useEffect} from "react";
import {useGlobalState, useGlobalMutation} from '../../utils/container'
import ColumnSettings from "./ColumnSettings";
import FilterPanel from "./FilterPanel";

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
  title: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.black, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
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
  const classes = useStyles();
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const [search, setSearch] = useState(null);

  const [state, setState] = useState(
      {
    mobileView: false,
    drawerOpen: false,
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



  const {mobileView, drawerOpen} = state;

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
  );

  const DarkSwitchBtn = (
      <IconButton {...{
        "aria-label": "menu",
        "aria-haspopup": "true",
        onClick: handleDarkModeToggle,
      }}>
        {state.darkMode ? <Brightness2Icon />: <Brightness4Icon />}
      </IconButton>
  );

  const displayDesktop = () => {
    return (
      <Toolbar className={classes.toolbar}>
        {nearLogo}
        {/*<Divider orientation="vertical" flexItem/>*/}
        {appLogo}
        {/*searchBox*/}
        <Divider className={classes.divider} orientation="vertical" flexItem />
        {DarkSwitchBtn}
        <FilterPanel {...props}/>
        <ColumnSettings {...props}/>
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
      <AppBar color="default" className={classes.appBar}>
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
    </>
  );
}
