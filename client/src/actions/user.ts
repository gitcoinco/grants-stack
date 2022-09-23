export const PROJECT_ID_SELECTED = "PROJECT_ID_SELECTED";

interface ProjectIdSelected {
  type: typeof PROJECT_ID_SELECTED;
  id: number;
}

export type UserActions = ProjectIdSelected;

export const projectIdSelected = (id: number) => ({
  type: PROJECT_ID_SELECTED,
  id,
});
