/* Copyright 2020 the Deno authors. All rights reserved. MIT license. */

import { handleRequest, withLog } from "./handler.ts";
import { listenAndServe } from "https://deno.land/std@0.108.0/http/server.ts";

const handler = withLog(handleRequest);

console.log("The server is available at http://localhost:8080");
listenAndServe(":8080", handler);
