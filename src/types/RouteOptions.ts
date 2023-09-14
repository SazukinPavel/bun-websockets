type RouteOptions = {
  method: "post" | "put" | "get" | "patch" | "delete" | "any";
  path: string;
};

export default RouteOptions;
