import "reflect-metadata";

function Controller(basepath: string) {
  return function (target: any) {
    Reflect.defineMetadata("controller-metadata", basepath, target);
  };
}

export default Controller;
