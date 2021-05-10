import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Switch,
  Divider,
  Avatar,
  Chip,
  InputBase,
} from "@material-ui/core";
import {fade, makeStyles} from '@material-ui/core/styles';
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from '@material-ui/icons/Search';
import React, {useState, useEffect} from "react";
import {useGlobalState, useGlobalMutation} from '../../utils/container'



const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: "darkgrey",
    paddingRight: "79px",
    paddingLeft: "118px",
    "@media (max-width: 900px)": {
      paddingLeft: 0,
    },
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
    padding: "20px 30px",
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
  const stateCtx = useGlobalState()
  const mutationCtx = useGlobalMutation()
  const [search, setSearch] = useState(null);

  const [state, setState] = useState({
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
  )


  const displayDesktop = () => {
    return (
      <Toolbar className={classes.toolbar}>
        {nearLogo}
        <Divider orientation="vertical" flexItem/>
        {darkSwitch}
        {appLogo}
        {/*searchBox*/}
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
        {searchBox}
      </Toolbar>
    );
  };


  const appLogo = (
    <>
      <Typography variant="h6" component="h1" className={classes.title}>
        Sputnik DAO v1 Stats - under development
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
    }
  ;

  return (
    <header>
      <AppBar color="default">
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
    </header>
  );
}
