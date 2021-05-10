import {SyncedCron} from 'meteor/littledata:synced-cron';

import "./daos";
import "./coingecko";
import './indexer';

SyncedCron.start();