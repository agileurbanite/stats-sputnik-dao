import {SyncedCron} from 'meteor/littledata:synced-cron';
import {CoinGeckoCurrencies, NearPrice} from "../imports/api/data";
import {Meteor} from "meteor/meteor";

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

const getPrice = async () => {
  return CoinGeckoClient.coins.fetch('near');
};

const getCoinGeckoCurrencies = async () => {
  return CoinGeckoClient.simple.supportedVsCurrencies();
}

if (Meteor.isServer) {

  SyncedCron.add({
    name: 'Pull CoinGecko Currencies',
    schedule: function (parser) {
      return parser.text('every 7 days');
    },
    job: async function () {
      try {
        const currencies = await getCoinGeckoCurrencies();
        if (currencies.success === true) {
          console.log(currencies)
          CoinGeckoCurrencies.update(
            {},
            {
              currencies: currencies.data
            },
            {upsert: true}
          )
        }
      } catch (e) {
        console.log(e);
      }
    }
  });


  SyncedCron.add({
    name: 'Pull Near Price',
    schedule: function (parser) {
      return parser.text('every 10 min');
    },
    job: async function () {
      try {
        const result = await getPrice();
        if (result.success === true) {
          NearPrice.update(
            {},
            {
              near_price_data: result.data.market_data,
            },
            {upsert: true}
          )
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

}
