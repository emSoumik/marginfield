import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { components } from "./_generated/api";
import { registerMailHttpRoutes } from "./mail";

const http = httpRouter();

auth.addHttpRoutes(http);
registerMailHttpRoutes(http);
registerStaticRoutes(http, components.staticHosting);

export default http;
