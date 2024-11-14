/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/start";
import { hydrateRoot } from "react-dom/client";
import { createBrowserClient } from "~/db/client";
import { createRouterCreator } from "./router";

const router = createRouterCreator(createBrowserClient)();

hydrateRoot(document, <StartClient router={router} />);
