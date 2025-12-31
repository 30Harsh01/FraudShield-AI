export const formatJsonListMerge = (existing: string[] = [], newEntry: string): string[] => {
  if (!newEntry) return existing;
  const set = new Set([...existing, newEntry]);
  return Array.from(set);
};
