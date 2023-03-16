import DeepCopy from "./DeepCopy";

test("deep copy", () => {
  expect(DeepCopy(undefined)).toBeUndefined();
});
