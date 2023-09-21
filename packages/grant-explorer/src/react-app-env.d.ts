declare module "*.svg" {
  export const ReactComponent;
  export default "";
}

declare module "*.png" {
  export const ReactComponent;
  export default "";
}

declare module "*.jpg" {
  export const ReactComponent;
  export default "";
}

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
