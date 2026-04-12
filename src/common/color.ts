import { themes } from "../themes/index";

type ThemeColors = {
  title_color?: string;
  text_color?: string;
  icon_color?: string;
  bg_color?: string;
  border_color?: string;
  ring_color?: string;
  theme?: string;
};

type ColorResult = string | string[];

const isValidHexColor = (hexColor: string): boolean => {
  return new RegExp(
    /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/,
  ).test(hexColor);
};

const isValidGradient = (colors: string[]): boolean => {
  return (
    colors.length > 2 &&
    colors.slice(1).every((color) => isValidHexColor(color))
  );
};

const fallbackColor = (
  color: string | string[] | undefined,
  fallbackColor: string,
): string => {
  const colors = typeof color === "string" ? color.split(",") : Array.isArray(color) ? color : [];

  if (colors.length === 1 && isValidHexColor(colors[0])) {
    return `#${colors[0]}`;
  }

  if (typeof color === "string" && isValidHexColor(color)) {
    return `#${color}`;
  }

  return fallbackColor;
};

const fallbackGradientColor = (
  color: string | string[] | undefined,
  fallbackColor: string,
): ColorResult => {
  const colors = typeof color === "string" ? color.split(",") : Array.isArray(color) ? color : [];
  if (colors.length > 1 && isValidGradient(colors)) {
    return colors;
  }

  if (typeof color === "string" && isValidHexColor(color)) {
    return `#${color}`;
  }

  return fallbackColor;
};

const getCardColors = ({
  title_color,
  text_color,
  icon_color,
  bg_color,
  border_color,
  ring_color,
  theme,
}: ThemeColors) => {
  const defaultTheme = themes["default"];
  const isThemeProvided = theme !== null && theme !== undefined;

  const selectedTheme = (isThemeProvided
    ? themes[theme as keyof typeof themes]
    : defaultTheme) as Record<string, string | undefined>;

  const defaultBorderColor =
    "border_color" in selectedTheme
      ? selectedTheme.border_color
      : defaultTheme.border_color;

  // get the color provided by the user else the theme color
  // finally if both colors are invalid fallback to default theme
  const titleColor = fallbackColor(
    title_color || selectedTheme.title_color,
    "#" + defaultTheme.title_color,
  );

  // get the color provided by the user else the theme color
  // finally if both colors are invalid we use the titleColor
  const ringColor = fallbackColor(
    ring_color || selectedTheme.ring_color,
    titleColor,
  );
  const iconColor = fallbackColor(
    icon_color || selectedTheme.icon_color,
    "#" + defaultTheme.icon_color,
  );
  const textColor = fallbackColor(
    text_color || selectedTheme.text_color,
    "#" + defaultTheme.text_color,
  );
  const bgColor = fallbackGradientColor(
    bg_color || selectedTheme.bg_color,
    "#" + defaultTheme.bg_color,
  );

  const borderColor = fallbackColor(
    border_color || defaultBorderColor,
    "#" + defaultBorderColor,
  );

  return {
    titleColor,
    iconColor,
    textColor,
    bgColor,
    borderColor,
    ringColor,
  };
};

export { isValidHexColor, isValidGradient, getCardColors };
