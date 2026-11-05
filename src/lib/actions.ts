export type MomentAction = {
  id: string;
  title: string;
  invitation: string;
};

/** Invitations, not tasks. Wording is deliberately soft and brief. */
export const MOMENT_ACTIONS: MomentAction[] = [
  {
    id: "reconnect",
    title: "Reconnect",
    invitation: "Reach out to someone you've been thinking about.",
  },
  {
    id: "create",
    title: "Create",
    invitation: "Spend 10 minutes making something for yourself.",
  },
  {
    id: "step-outside",
    title: "Step Outside",
    invitation: "Take a walk and notice your surroundings.",
  },
  {
    id: "let-go",
    title: "Let Go",
    invitation: "Identify something you don't need to carry today.",
  },
  {
    id: "make-space",
    title: "Make Space",
    invitation: "Give yourself permission to pause or remove something unnecessary.",
  },
  {
    id: "follow-curiosity",
    title: "Follow Your Curiosity",
    invitation: "Explore something that genuinely interests you.",
  },
];

export const CUSTOM_ACTION_ID = "custom";
