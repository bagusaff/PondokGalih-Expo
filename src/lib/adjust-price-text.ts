import { currencyFormatter } from './currency-formatter';

// 1:1 port of helpers/AdjustPriceText.js — receipt row/divider generation.
// FROZEN: byte-identical output feeds the thermal printer.

export const adjustPriceText = (text: string, spaceCount = 40) => {
  let addSpace = '';
  const concatText = () => {
    return (addSpace = addSpace.concat(' '));
  };
  for (let i = spaceCount; i > 0; i--) {
    concatText();
  }
  return addSpace.concat(text);
};

export const addSpaceToLeftSide = (text: string, spaceCount = 40) => {
  let addSpace = '';
  const concatText = () => {
    return (addSpace = addSpace.concat(' '));
  };

  for (let i = spaceCount; i > 0; i--) {
    concatText();
  }
  return addSpace.concat(text);
};

export const generateReceiptRowText = (
  totalChar = 48,
  title: string,
  value: number,
  alignText = 'L',
) => {
  const spaceForRows =
    totalChar - (title?.length + currencyFormatter(value)?.length + 2);
  const formatedValue = addSpaceToLeftSide(currencyFormatter(value), spaceForRows);
  return `<${alignText}>${title} :${formatedValue}</${alignText}>\n`;
};

export const generateDivider = (totalChar: number) => {
  let addDivider = '';
  const concatText = () => {
    return (addDivider = addDivider.concat('-'));
  };
  for (let i = 0; i < totalChar; i++) {
    concatText();
  }
  return `<C>${addDivider}</C>\n`;
};
