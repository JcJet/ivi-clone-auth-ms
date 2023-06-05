export function logCall() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const targetMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.log(`In ${propertyKey} at ${new Date()}`);
      return targetMethod.apply(this, args);
    };
  };
}
