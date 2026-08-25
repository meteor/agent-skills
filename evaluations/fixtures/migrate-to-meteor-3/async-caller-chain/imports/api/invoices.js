import { Meteor } from "meteor/meteor";
import { Orders } from "./orders";

function findOrder(id) {
  return Orders.findOne(id);
}

function calculateTotal(id) {
  return findOrder(id).total;
}

function buildInvoice(id) {
  return { total: calculateTotal(id) };
}

Meteor.methods({
  createInvoice(id) {
    return buildInvoice(id);
  },
});
