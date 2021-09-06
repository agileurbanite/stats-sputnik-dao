import {Meteor} from "meteor/meteor";
import {SyncedCron} from 'meteor/littledata:synced-cron';

/*
async function queryPg(block_timestamp) {
  const {Client} = require('pg')
  const connectionString = 'postgres://public_readonly:nearprotocol@104.199.89.51/mainnet_explorer'

  let q =
    `SELECT *
     FROM transactions t,
          receipts r,
          blocks b,
          transaction_actions a,
          action_receipt_actions ra,
          execution_outcomes e
     WHERE t.transaction_hash = r.originated_from_transaction_hash
       AND r.receipt_id = e.receipt_id
       AND b.block_timestamp = r.included_in_block_timestamp
       AND ra.receipt_id = r.receipt_id
       AND t.transaction_hash = a.transaction_hash
       AND a.action_kind = 'FUNCTION_CALL'
       AND e.status = 'SUCCESS_VALUE'
       AND r.predecessor_account_id != 'system'
       AND t.receiver_account_id LIKE ('%.sputnikdao.near')
       AND t.block_timestamp >= $1
     ORDER BY t.block_timestamp ASC
     LIMIT 300
    `;

  const values = [block_timestamp]
  const client = new Client({
    connectionString: connectionString
  });
  await client.connect()
  const res = await client.query(q, values);
  console.log(res.rows.length);
  await client.end()
  return res.rows;
}

/*
queryPg(1598366209232845339).then((r) => {
  //console.log(r);
}).catch((e) => {
  console.log(e);
})
*/


const autobahn = require("autobahn");

import {TxActions} from "../imports/api/data";


let session;
const connection = new autobahn.Connection({
  url: "wss://near-explorer-wamp.onrender.com/ws",
  realm: "near-explorer",
  retry_if_unreachable: true,
  max_retries: 5,
  max_retry_delay: 10
});

connection.onopen = (s, details) => {
  session = s;
  console.log('session open', details);
//  console.log(session);

/*
  storeTransactions().then((r) => {
    console.log('done');
  }).catch((e) => {
    console.log(e);
  })
*/


};

connection.onclose = (reason, details) => {
  console.log('connection close');
  console.log('Reason:');
  console.log(reason);
  console.log('Details:');
  console.log(details);
};

connection.open();

async function query(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.select`;
  return session.call(procedure, q);
}

async function queryPostgres(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.select:INDEXER_BACKEND`;
  return session.call(procedure, q);
}

async function queryNearCoreTx(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.nearcore-tx`;
  return session.call(procedure, q);
}



async function getTransactions(block_timestamp) {
  return await queryPostgres([
    `SELECT *
     FROM transactions t,
          receipts r,
          blocks b,
          transaction_actions a,
          action_receipt_actions ra,
          execution_outcomes e
     WHERE t.transaction_hash = r.originated_from_transaction_hash
       AND r.receipt_id = e.receipt_id
       AND b.block_timestamp = r.included_in_block_timestamp
       AND ra.receipt_id = r.receipt_id
       AND t.transaction_hash = a.transaction_hash
       AND a.action_kind = 'FUNCTION_CALL'
       AND e.status = 'SUCCESS_VALUE'
       AND r.predecessor_account_id != 'system'
       AND t.receiver_account_id LIKE ('%.sputnikdao.near')
       AND t.block_timestamp >= :block_timestamp
     ORDER BY t.block_timestamp ASC
     LIMIT :limit
    `, {
      limit: 300,
      block_timestamp: block_timestamp
    }
  ]).then(data => {
      //console.log(data)
      console.log(data.length);
      return data;
    }
  ).catch((e) => {
    console.log(e);
  });
}


if (Meteor.isServer) {
  SyncedCron.add({
    name: 'Fetch Transactions',
    schedule: function (parser) {
      return parser.text('every 1 minutes');
    },
    job: async function () {
      await storeTransactions()
    }
  });
}


async function storeTransactions() {
  let d = new Date();
  d.setDate(d.getDate() - 3);
  let blockTimestamp = d.getTime() * 1000 * 1000;
  /* To received the data from Epoch2, uncomment below */
  //let blockTimestamp = 1598366209232845339;
  /* -------------------------------------------------- */
  let len = 300;
  let offset = 0;
  while (len > 0) {
    const transactions = await getTransactions(blockTimestamp);
    if (transactions) {
      len = transactions.length;
    } else {
      len = 0;
      console.log('most likely an error occurred')
    }
    if (len > 1) {

      blockTimestamp = transactions[len - 1].block_timestamp;
      offset = offset + len;

      transactions.map((item) => {
        try {
          TxActions.update(
            {
              transaction_hash: item.transaction_hash,
              block_timestamp: Number(item.block_timestamp),
              block_height: Number(item.block_height),
              signer_account_id: item.signer_account_id,
              receiver_account_id: item.receiver_account_id,
              receipt_receiver_account_id: item.receipt_receiver_account_id,
              predecessor_account_id: item.predecessor_account_id,
              gas: item.gas,
              action_kind: item.action_kind,
              method_name: item.args.method_name,
              args_base64: item.args.args_base64 ? Buffer.from(item.args.args_base64, 'base64').toString('utf-8') : null,
              args: !item.args.args_base64 ? item.args : null,
            },
            {
              transaction_hash: item.transaction_hash,
              block_timestamp: Number(item.block_timestamp),
              block_height: Number(item.block_height),
              signer_account_id: item.signer_account_id,
              receiver_account_id: item.receiver_account_id,
              receipt_receiver_account_id: item.receipt_receiver_account_id,
              predecessor_account_id: item.predecessor_account_id,
              gas: item.gas,
              action_kind: item.action_kind,
              method_name: item.args.method_name,
              args_base64: item.args.args_base64 ? Buffer.from(item.args.args_base64, 'base64').toString('utf-8') : null,
              args: !item.args.args_base64 ? item.args : null,
            },
            {upsert: true}
          )
        } catch (e) {
          console.log(e);
        }

      })
    }
  }
}

/*
async function consolidateData() {
  const data = TxActions.find({"action_kind": "TRANSFER"}).fetch();
  for (const item of data) {
    //console.log(data);
    try {
      ConsolidatedDataDeposits.update(
        {
          kind: item.action_kind,
          dao: item.predecessor_account_id,
          signer_account_id: item.signer_account_id,
          receiver_account_id: item.receiver_account_id,
        },
        {
          kind: item.action_kind,
          dao: item.predecessor_account_id,
          signer_account_id: item.signer_account_id,
          receiver_account_id: item.receiver_account_id,
          deposit: item.args.deposit,

        },
        {upsert: true}
      )
    } catch (e) {
      console.log(e);
    }

  }
}

consolidateData().then((r) => {
  //console.log(r)
}).catch((e) => {
  console.log(e);
});
*/
