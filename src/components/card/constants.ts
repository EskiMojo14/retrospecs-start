export const cardVariants = ["filled", "raised"] as const;

export type CardVariant = (typeof cardVariants)[number];
