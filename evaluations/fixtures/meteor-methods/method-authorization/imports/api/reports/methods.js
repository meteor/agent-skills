import { Meteor } from "meteor/meteor";
import { Reports } from "./reports";

Meteor.methods({
  async "reports.create"(report) {
    return Reports.insertAsync({ ...report });
  },
});
