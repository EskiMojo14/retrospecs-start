import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { object, optional, string } from "valibot";
import { AppBar, AppBarRow } from "~/components/app-bar";
import { Button } from "~/components/button";
import { LineBackground } from "~/components/line-background";
import { Symbol } from "~/components/symbol";
import { toastQueue } from "~/components/toast";
import { Toolbar } from "~/components/toolbar";
import { useSupabase } from "~/db/provider";
import { Footer } from "~/features/footer";
import { Logo } from "~/features/logo";
import SvgGithub from "~/icons/github";
import styles from "./sign-in.module.scss";

const getURL = () => {
  if (typeof process === "undefined") return "http://localhost:5173/";
  let url =
    process.env.SITE_URL ??
    process.env.VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};

export const signinSearchSchema = object({
  error: optional(string()),
  error_description: optional(string()),
});

export const Route = createFileRoute("/sign-in")({
  validateSearch: signinSearchSchema,
  loader: () => ({ url: getURL() }),
  component: SignIn,
  meta: () => [{ title: "RetroSpecs - Sign In" }],
});

function SignIn() {
  const router = useRouter();
  const { url } = Route.useLoaderData();
  const supabase = useSupabase();
  const { error, error_description: errorDescription } = Route.useSearch();

  const toastKeyRef = useRef<string>();

  useEffect(() => {
    if ((error || errorDescription) && !toastKeyRef.current) {
      toastKeyRef.current = toastQueue.add(
        {
          type: "error",
          title: error,
          description: errorDescription ?? "An error occurred.",
        },
        {
          onClose: () => {
            toastKeyRef.current = undefined;
          },
        },
      );
      void router.navigate({
        to: "/sign-in",
        search: {},
        replace: true,
      });
    }
  }, [error, errorDescription, router]);

  return (
    <LineBackground
      opacity={0.5}
      contentProps={{
        className: styles.content,
      }}
    >
      <AppBar>
        <AppBarRow>
          <Toolbar slot="nav">
            <Logo />
          </Toolbar>
        </AppBarRow>
      </AppBar>
      <Form className={styles.form}>
        <Button
          variant="elevated"
          onPress={() => {
            void supabase.auth.signInWithOAuth({
              provider: "github",
              options: {
                redirectTo: `${url}auth/callback`,
              },
            });
          }}
        >
          <Symbol slot="leading">
            <SvgGithub height={16} width={16} />
          </Symbol>
          Sign in with GitHub
        </Button>
      </Form>
      <Footer />
    </LineBackground>
  );
}
