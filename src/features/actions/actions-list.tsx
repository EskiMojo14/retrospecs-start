import { LineBackground } from "~/components/line-background";
import { Symbol } from "~/components/symbol";
import { Tab, TabList, TabPanel, Tabs } from "~/components/tabs";
import { Heading } from "~/components/typography";
import styles from "./actions-list.module.scss";

export function ActionList() {
  return (
    <div className={styles.list}>
      <LineBackground>
        <header>
          <Heading variant="headline6">Actions</Heading>
        </header>
        <Tabs>
          <TabList variant="outlined" inlineIcons className={styles.tabs}>
            <Tab id="previous" icon={<Symbol>history</Symbol>}>
              Carried forward
            </Tab>
            <Tab id="next" icon={<Symbol>update</Symbol>}>
              Next
            </Tab>
          </TabList>
          <TabPanel id="previous"></TabPanel>
          <TabPanel id="next"></TabPanel>
        </Tabs>
      </LineBackground>
    </div>
  );
}
