export const BaseTitle = {
  MR: 'Mr',
  MRS: 'Mrs',
  MS: 'Ms',
} as const;

export const Title = {
  ...BaseTitle,
  DR: 'Dr',
  PROF: 'Prof',
} as const;
export type Title = typeof Title[keyof typeof Title];

/** Traveler titles include Mstr (master for minors) per FRD §3.3 */
export const TravelerTitle = {
  ...BaseTitle,
  MSTR: 'Mstr',
} as const;
export type TravelerTitle = typeof TravelerTitle[keyof typeof TravelerTitle];
