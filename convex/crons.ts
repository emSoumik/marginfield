import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("fail stale imports and briefings", { minutes: 1 }, internal.jobs.failStale, {});

export default crons;
