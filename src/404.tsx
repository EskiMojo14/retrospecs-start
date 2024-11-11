import { EmptyState } from "~/components/empty";
import { ExternalLink } from "~/components/link";
import { Symbol } from "~/components/symbol";
import styles from "./error-page.module.scss";

export function ForeEauFore() {
  return (
    <main className={styles.page}>
      <EmptyState
        icon={<Symbol>not_listed_location</Symbol>}
        title="Not all who wander are lost."
        description="But you probably are."
        size="x-large"
      />
      <ExternalLink href="/">Go back home</ExternalLink>
    </main>
  );
}
