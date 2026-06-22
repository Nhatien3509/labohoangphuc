import { type RecursiveObject, getAllPaths } from "@common/lib/helpers/obj";

import { describe, expect, test } from "vitest";

describe("test getAllPath", () => {
  const expectedOutput1 = {
    project: {
      enableSpendingLimits: true,
      limList: [
        {
          frequency: "0",
          amount: "8",
        },
        {
          frequency: "1",
          amount: "8",
        },
        {
          frequency: "2",
          amount: "9",
        },
      ],
    },
  } as RecursiveObject;
  const expectedOutput2 = {
    projectSlug: "1234567",
    enableSpendingLimits: true,
    limList: [
      {
        frequency: "0",
        amount: "8",
      },
      {
        frequency: "1",
        amount: "8",
      },
      {
        frequency: "2",
        amount: "9",
      },
    ],
  } as RecursiveObject;
  const output = [
    "project",
    "project.enableSpendingLimits",
    "project.limList",
    "project.limList.0",
    "project.limList.0.frequency",
    "project.limList.0.amount",
    "project.limList.1",
    "project.limList.1.frequency",
    "project.limList.1.amount",
    "project.limList.2",
    "project.limList.2.frequency",
    "project.limList.2.amount",
  ];

  test("correct filter", () => {
    expect(JSON.stringify(getAllPaths(expectedOutput1))).toEqual(
      JSON.stringify(output),
    );
  });

  test("incorrect filter", () => {
    expect(JSON.stringify(getAllPaths(expectedOutput2))).not.equal(
      JSON.stringify(output),
    );
  });
});
