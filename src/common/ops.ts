const parseBoolean = (value: boolean | string | undefined): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  return undefined;
};

const parseArray = (str: string | undefined): string[] => {
  if (!str) return [];
  return str.split(",");
};

const clampValue = (number: number, min: number, max: number): number => {
  if (Number.isNaN(parseInt(number.toString(), 10))) {
    return min;
  }
  return Math.max(min, Math.min(number, max));
};

const lowercaseTrim = (name: string): string => name.toLowerCase().trim();

const chunkArray = <T>(arr: T[], perChunk: number): T[][] => {
  return arr.reduce((resultArray: T[][], item: T, index: number) => {
    const chunkIndex = Math.floor(index / perChunk);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, [] as T[][]);
};

const parseEmojis = (str: string): string => {
  if (!str) {
    throw new Error("[parseEmoji]: str argument not provided");
  }
  return str.replace(/:\w+:/gm, (emoji: string) => toEmoji.get(emoji) ?? "");
};

const dateDiff = (d1: string | Date, d2: string | Date): number => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diff = date1.getTime() - date2.getTime();
  return Math.round(diff / (1000 * 60));
};

export {
  parseBoolean,
  parseArray,
  clampValue,
  lowercaseTrim,
  chunkArray,
  parseEmojis,
  dateDiff,
};