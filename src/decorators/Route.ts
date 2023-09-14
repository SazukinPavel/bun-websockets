import "reflect-metadata";
import { RouteOptions } from "../types";

function Route(data: RouteOptions = { method: "any", path: "" }) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("route-metadata", data, target, propertyKey);
  };
}

export default Route;
