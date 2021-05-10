import nearApi from "near-api-js";
import {sha256} from "js-sha256";
import {Meteor} from "meteor/meteor";
import {SyncedCron} from 'meteor/littledata:synced-cron';
import {DaoData} from "../imports/api/data";

export const factory = 'sputnikdao.near';
export const todayDate = new Date().toISOString().slice(0, 10);

//export const NEAR_RPC_URL = 'https://rpc.mainnet.near.org'
export const NEAR_RPC_URL = 'http://45.157.177.152:3030';
const provider = new nearApi.providers.JsonRpcProvider(NEAR_RPC_URL);
const connection = new nearApi.Connection(NEAR_RPC_URL, provider, {});
const account = new nearApi.Account(connection, '');

async function accountExists(accountId) {
  try {
    return await new nearApi.Account(connection, accountId).state();
  } catch (error) {
    return false;
  }
}

async function getDaoList(factory) {
  return await account.viewFunction(factory, 'get_dao_list', {})
}

async function getDaoData(dao) {
  const state = await accountExists(dao);

  if (state) {
    const council = await account.viewFunction(dao, 'get_council', {})
    const purpose = await account.viewFunction(dao, 'get_purpose', {})
    const votePeriod = await account.viewFunction(dao, 'get_vote_period', {})
    const bond = await account.viewFunction(dao, 'get_bond', {})

    /* change to pagination */
    let proposals = await account.viewFunction(dao, 'get_proposals', {from_index: 0, limit: 1000000})
    proposals.forEach(function (v) {
      delete v.votes
    });

    return {
      council: council,
      purpose: purpose,
      proposals: proposals,
      votePeriod: votePeriod,
      bond: bond,
      amount: state.amount,
    }
  } else {
    return false;
  }
}


async function storeDaoList() {
  const daos = await getDaoList(factory);
  let stop = false
  console.log('total daos: ' + daos.length);
  for (const item of daos) {
    if (!stop) {
      const dao = await getDaoData(item);
      //stop = true;

      if (dao) {
        try {
          DaoData.update(
            {
              daoName: item,
            },
            {
              daoName: item,
              council: dao.council,
              purpose: dao.purpose,
              proposals: dao.proposals,
              votePeriod: dao.votePeriod,
              bond: dao.bond,
              amount: dao.amount,
            },
            {upsert: true}
          )
        } catch (e) {
          console.log(dao);
          console.log(e);
        }
      }

    }
  }
}

/*
storeDaoList().then().catch((e) => {
  console.log(e)
})
*/

if (Meteor.isServer) {
  SyncedCron.add({
    name: 'Fetch Dao Data',
    schedule: function (parser) {
      return parser.text('every 10 minutes');
    },
    job: async function () {
      await storeDaoList()
    }
  });
}
