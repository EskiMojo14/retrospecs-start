import { EmptyState } from "~/components/empty";
import { ExternalLink } from "~/components/link";
import "./footer.scss";

export function Footer() {
  return (
    <footer className="footer">
      <EmptyState
        size="small"
        title={
          <>
            Created by{" "}
            <ExternalLink href="https://github.com/EskiMojo14/">
              eskimojo
            </ExternalLink>
          </>
        }
        description={
          <ExternalLink href="https://github.com/EskiMojo14/retrospecs">
            Github
          </ExternalLink>
        }
      />
    </footer>
  );
}
