import assert from "node:assert/strict";
import test from "node:test";

import {
  assertValidSegment,
  assertValidSlug,
  segmentToCamel,
  slugToCamel,
  slugToFeatureEnvConst,
  slugToPascal,
  slugToRoutesKey,
  tsconfigPathKey,
  vitestAliasKey,
} from "./slug.mjs";

test("slugToPascal", () => {
  assert.equal(slugToPascal("dbaas"), "Dbaas");
  assert.equal(slugToPascal("my-service"), "MyService");
});

test("slugToCamel / slugToRoutesKey", () => {
  assert.equal(slugToCamel("my-service"), "myService");
  assert.equal(slugToRoutesKey("my-service"), "myService");
});

test("segmentToCamel", () => {
  assert.equal(segmentToCamel("items"), "items");
  assert.equal(segmentToCamel("my-items"), "myItems");
});

test("alias keys", () => {
  assert.equal(tsconfigPathKey("my-service"), "@my-service/*");
  assert.equal(vitestAliasKey("my-service"), "@my-service");
});

test("slugToFeatureEnvConst", () => {
  assert.equal(slugToFeatureEnvConst("dbaas"), "DBAAS_ENABLE");
  assert.equal(slugToFeatureEnvConst("my-service"), "MY_SERVICE_ENABLE");
});

test("assertValidSlug rejects invalid", () => {
  assert.throws(() => assertValidSlug(""), /required/);
  assert.throws(() => assertValidSlug("MyService"), /Invalid slug/);
  assert.throws(() => assertValidSlug("bad--name"), /Invalid slug/);
});

test("assertValidSegment", () => {
  assert.throws(() => assertValidSegment("Bad"), /Invalid slug/);
});
