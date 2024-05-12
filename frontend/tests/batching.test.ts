import { describe, expect, it } from "vitest";
import { promiseAllInBatches } from "~/utils/batching";

describe("promiseAllInBatches", () => {
  it("should process tasks in batches", async () => {
    const task = (num: number) => Promise.resolve(num * 2);
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const batchSize = 2;

    const result = await promiseAllInBatches(task, input, batchSize);

    expect(result).toStrictEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });

  it("should return an empty array for empty input", async () => {
    const task = (num: number) => Promise.resolve(num * 2);
    const input: any[] = [];
    const batchSize = 2;

    const result = await promiseAllInBatches(task, input, batchSize);

    expect(result).toStrictEqual([]);
  });

  it("should throw an error if a task fails", async () => {
    const task = (num: number) => {
      if (num === 5) {
        return Promise.reject(new Error("Task failed"));
      }
      return Promise.resolve(num * 2);
    };

    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const batchSize = 2;

    await expect(promiseAllInBatches(task, input, batchSize))
      .rejects
      .toThrow("Task failed");
  });

  // Add more test cases as needed.
});
