import { clsx } from "clsx";
import { LineBackground } from "~/components/line-background";
import type { BackgroundColor } from "~/components/line-background/constants";
import { Heading } from "~/components/typography";
import type { Category } from "~/features/feedback";
import styles from "./feedback-list.module.scss";

export interface FeedbackListProps {
  category: Category;
}

const categoryTitles: Record<Category, string> = {
  good: "Good",
  neutral: "Neutral",
  improvement: "Needs improvement",
};

const categoryColors: Record<Category, BackgroundColor> = {
  good: "green",
  neutral: "blue",
  improvement: "red",
};

export function FeedbackList({ category }: FeedbackListProps) {
  return (
    <div className={clsx(styles.list, styles[category])}>
      <LineBackground color={categoryColors[category]}>
        <header>
          <Heading variant="headline6">{categoryTitles[category]}</Heading>
        </header>
      </LineBackground>
    </div>
  );
}
