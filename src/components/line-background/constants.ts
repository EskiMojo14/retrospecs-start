export const backgroundColors = ["blue", "red", "green"] as const;

export type BackgroundColor = (typeof backgroundColors)[number];
