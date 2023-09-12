/// <reference types="react-scripts" />

declare module "*.svg" {
  const content: string;
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;
  export default content;
}

declare module "*.png" {
  const content: string;
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;
  export default content;
}
