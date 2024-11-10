/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/start";
import { hydrateRoot } from "react-dom/client";
import { createBrowserClient } from "~/db/client";
import { createRouterCreator } from "./router";

const router = createRouterCreator(createBrowserClient)();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

hydrateRoot(root, <StartClient router={router} />);
