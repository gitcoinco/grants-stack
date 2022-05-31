import { Dispatch } from "redux";
import { ethers, BigNumber } from "ethers";
import { RootState } from "../reducers";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { global } from "../global";
import { addressesByChainID } from "../contracts/deployments";

export const PROJECTS_LOADING = "PROJECTS_LOADING";
interface ProjectsLoadingAction {
  type: typeof PROJECTS_LOADING;
}

export const PROJECTS_LOADED = "PROJECTS_LOADED";
interface ProjectsLoadedAction {
  type: typeof PROJECTS_LOADED;
  projects: number[];
}

export const PROJECTS_UNLOADED = "PROJECTS_UNLOADED";
export interface ProjectsUnloadedAction {
  type: typeof PROJECTS_UNLOADED;
}

export type ProjectsActions =
  | ProjectsLoadingAction
  | ProjectsLoadedAction
  | ProjectsUnloadedAction;

const projectsLoading = () => ({
  type: PROJECTS_LOADING,
});

const projectsLoaded = (projects: number[]) => ({
  type: PROJECTS_LOADED,
  projects,
});

const projectsUnload = () => ({
  type: PROJECTS_UNLOADED,
});

export const loadProjects =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(projectsLoading());

    const state = getState();
    const { chainID } = state.web3;

    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider!.getSigner();
    const contract = new ethers.Contract(
      addresses.projectRegistry,
      ProjectRegistryABI,
      signer
    );

    const filter = contract.filters.ProjectCreated(state.web3.account);
    const res = await contract.queryFilter(filter);
    const projectIds = res.map((x: any) =>
      BigNumber.from(x.args[1]).toNumber()
    );
    dispatch(projectsLoaded(projectIds));
  };

export const unloadProjects = () => projectsUnload();
