import React from "react";
import {makeStyles, withStyles} from "@material-ui/core/styles";
import {Box, Divider, IconButton, Menu, Typography, ListItemText, Checkbox, ListItemIcon, ListItem} from "@material-ui/core";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import TuneIcon from "@material-ui/icons/Tune";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: 300,
        },
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
}));


export default function ColumnSettings(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleSettingsToggle = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setAnchorEl(null);
    };

    const DialogTitle = React.forwardRef((props, ref) => {
        const { children, onClose, ...other } = props;
        return (
            <Box className={classes.dialogTitle} {...other} ref={ref}>
                <Typography style={{ fontWeight: 600 }} variant="h6" component="h6">{children}</Typography>
                {onClose ? (
                    <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </Box>
        );
    });

    const StyledMenu = withStyles({
        paper: {
            width: 300,
            border: '1px solid #d3d4d5',
        },
    })((props) => (
        <React.Fragment>
            <Menu
                elevation={0}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                {...props}
            />
        </React.Fragment>
    ));

    const StyledMenuItem = withStyles((theme) => ({
        root: {
            '&:focus': {
                backgroundColor: theme.palette.primary.main,
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                    color: theme.palette.common.white,
                },
            },
        },
    }))(ListItem);

    const ColumnItems =  (items) => {
        return (
            items?.columns ? items.columns.map( (item, index) => (
                <React.Fragment key={item.field}>
                    <StyledMenuItem  index={index} variant="body2">
                        <ListItemIcon>
                            <DragHandleIcon fontSize="small" />
                        </ListItemIcon>
                        <Box width="100%">
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <ListItemText disableTypography primary={<Typography variant="body2">{item.headerName}</Typography>}/>
                                <Checkbox
                                    id={item.field}
                                    color="primary"
                                    checked={!item.hide}
                                    onChange={props.hideColumn}
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                />
                            </Box>
                            <Divider />
                        </Box>
                    </StyledMenuItem>
                </React.Fragment>
            )) : null
        )
    };

    return (
        <div className={classes.root}>
            <div>
                <IconButton
                    aria-controls="customized-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleSettingsToggle}>
                    <TuneIcon />
                </IconButton>
                <StyledMenu
                    id="customized-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleSettingsClose}
                >
                    <DialogTitle id="settings-dialog-title" onClose={handleSettingsClose}>
                        Column settings
                    </DialogTitle>
                    <Divider/>
                    <ColumnItems columns={props.columns}/>
                </StyledMenu>
            </div>
        </div>
    );
}