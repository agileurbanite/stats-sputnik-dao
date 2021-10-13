import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

function Copyright() {
  return (
    <CssBaseline>
      <Typography variant="body2" color="textSecondary" align="center">
        <Link color="inherit" href="/">
          Sputnik v1 Dao Stats
        </Link>{' '}
        {new Date().getFullYear()}.
        {" "}The software is an <b>open source</b> and provided “as is”, without warranty of any kind.
        View on <Link target="_blank" rel="nofollow" color="inherit" href="https://github.com/NEAR-labs/stats-sputnik-dao">
        Github
      </Link>

      </Typography>
    </CssBaseline>
  );
}

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
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
