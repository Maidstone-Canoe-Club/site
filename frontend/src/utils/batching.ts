export async function promiseAllInBatches (task: Function, items: any[], batchSize: number) {
  let position = 0;
  let results : Promise<any>[] = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [...results, ...await Promise.all(itemsForBatch.map(item => task(item)))];
    position += batchSize;
  }
  return results;
}
