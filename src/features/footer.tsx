import { EmptyState } from "~/components/empty";
import { Link } from "~/components/link";
import "./footer.scss";

export function Footer() {
  return (
    <footer className="footer">
      <EmptyState
        size="small"
        title={
          <>
            Created by{" "}
            <Link href="https://github.com/EskiMojo14/">eskimojo</Link>
          </>
        }
        description={
          <Link href="https://github.com/EskiMojo14/retrospecs">Github</Link>
        }
      />
    </footer>
  );
}
