export function setColorOptionsWithOpacity (values: any) {
  const opacity = values.opacity || 1;
  if (values.color) {
    values.color = setColorOpacity(values.color, opacity);
  }
  if (values.borderColor) {
    values.borderColor = setColorOpacity(values.borderColor, opacity);
  }
  if (values.shadowColor) {
    values.shadowColor = setColorOpacity(values.shadowColor, opacity);
  }

  return values
}


/**
 * opacity must be between 0 and 1
 */

export function setColorOpacity (color: string, opacity: number) {
  // Make sure opacity is rounded to 2 decimal places
  opacity = Math.round(opacity * 100) * 0.01; 

  if (color.startsWith('rgba')) {
    return setRgbaOpacity(color, opacity);
  } else if (color.startsWith('#')) {
    return setHexOpacity(color, opacity);
  } else if (color.startsWith('rgb')) {
    return setRgbOpacity(color, opacity);
  }
}

function setRgbaOpacity(rgba: string, opacity: number) {
  return rgba.replace(/\d*.\d/, opacity + '');
}

function setHexOpacity(hex: string, opacity: number) {
  const {r, g, b } = hexToRgb(hex)!;
  return `rgb(${r},${g},${b},${opacity})`;
}

function setRgbOpacity(rgb: string, opacity: number) {
  return rgb.replace(')', `,${opacity})`).replace('rgb', 'rgba');
}


function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}