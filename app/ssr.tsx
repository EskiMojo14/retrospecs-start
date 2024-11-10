/// <reference types="vinxi/types/server" />
import { getRouterManifest } from "@tanstack/start/router-manifest";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/start/server";

import { createServerClient } from "~/db/server";
import { createRouterCreator } from "./router";

export default createStartHandler({
  createRouter: createRouterCreator(createServerClient),
  getRouterManifest,
})(defaultStreamHandler);
