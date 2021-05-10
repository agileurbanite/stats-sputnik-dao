import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="/">
        Sputnik Dao Stats
      </Link>{' '}
      {new Date().getFullYear()}
      <h3>Developed by Stardust Staking and Solutions OÜ, Tallinn, Estonia, <a href="https://starduststaking.com" target="_blank">https://starduststaking.com</a></h3>
      The software is an <b>open source</b> and provided “as is”, without warranty of any kind.
      View on <a href="https://github.com/Stardust-Staking" target="_blank" rel="nofollow">Github</a>
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
  },
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Container maxWidth="sm">
        <Copyright/>
      </Container>
    </footer>
  );
}
