import type { ReactNode } from "react";
import type { Key } from "react-aria-components";
import { Collection, Section } from "react-aria-components";
import type { DividerContainerProps, DividerProps } from "~/components/divider";
import { DividerContainer } from "~/components/divider";
import { Header } from "~/components/typography";
import type { MenuItemTextProps, MenuItemProps } from ".";
import { Menu, MenuItem, MenuItemText } from ".";

interface CommonItemProps {
  id: Key;
  divider?: true | DividerProps["variant"] | DividerProps;
}

export interface StandardItem
  extends MenuItemTextProps,
    CommonItemProps,
    Omit<MenuItemProps<never>, "children" | "id"> {
  type?: never;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export interface SubmenuItem extends MenuItemTextProps, CommonItemProps {
  type: "submenu";
  leading?: ReactNode;
  children: Array<MenuItem>;
  variant?: "one-line" | "two-line";
}

export interface SectionItem extends CommonItemProps {
  type: "section";
  header: ReactNode;
  children: Array<MenuItem>;
}

export type MenuItem = StandardItem | SubmenuItem | SectionItem;

function getDividerProps(
  item: MenuItem,
): Omit<DividerContainerProps, "children" | "id"> {
  if (!item.divider) {
    return { variant: "none" };
  }
  if (typeof item.divider === "object") {
    return item.divider;
  }
  return {
    variant: typeof item.divider === "string" ? item.divider : undefined,
  };
}

export function renderMenuItem(item: MenuItem): React.JSX.Element {
  const dividerProps = getDividerProps(item);
  switch (item.type) {
    case "section":
      return (
        <DividerContainer id={item.id} {...dividerProps}>
          <Section>
            <Header variant="subtitle2">{item.header}</Header>
            <Collection items={item.children}>{renderMenuItem}</Collection>
          </Section>
        </DividerContainer>
      );
    case "submenu":
      return (
        <DividerContainer id={item.id} {...dividerProps}>
          <Menu
            variant={item.variant}
            items={item.children}
            isSubMenu
            trigger={
              <MenuItem>
                {item.leading}
                <MenuItemText
                  label={item.label}
                  description={item.description}
                />
              </MenuItem>
            }
          >
            {renderMenuItem}
          </Menu>
        </DividerContainer>
      );
    default: {
      const { leading, trailing, label, description, ...itemProps } = item;
      return (
        <DividerContainer id={item.id} {...dividerProps}>
          <MenuItem {...itemProps}>
            {leading}
            <MenuItemText label={label} description={description} />
            {trailing}
          </MenuItem>
        </DividerContainer>
      );
    }
  }
}
