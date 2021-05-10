import {Meteor} from 'meteor/meteor';
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {ValidatedMethod} from "meteor/mdg:validated-method";

export const TxActions = new Mongo.Collection("txActions");
export const DaoData = new Mongo.Collection("daoData");
export const CoinGeckoCurrencies = new Mongo.Collection("coinGeckoCurrencies");
export const NearPrice = new Mongo.Collection("nearPrice");
export const ConsolidatedDataDeposits = new Mongo.Collection("consolidatedDataDeposits");


if (Meteor.isServer) {

  Meteor.publish("TxActions", function () {
    return TxActions.find({});
  });
  Meteor.publish("DaoData", function () {
    return DaoData.find({});
  });
  Meteor.publish("CoinGeckoCurrencies", function () {
    return CoinGeckoCurrencies.find({});
  });
    Meteor.publish("NearPrice", function () {
    return NearPrice.find({});
  });
    Meteor.publish("ConsolidatedDataDeposits", function () {
    return ConsolidatedDataDeposits.find({});
  });
}


