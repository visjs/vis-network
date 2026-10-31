export interface ComponentUtilRect {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface ComponentUtilPoint {
  x: number;
  y: number;
}

export interface ComponentUtilRotationPoint extends ComponentUtilPoint {
  angle: number;
}

export function choosify(
  subOption: string,
  pile: object[],
): boolean | ((...args: any[]) => any);

export function pointInRect(
  rect: ComponentUtilRect,
  point: ComponentUtilPoint,
  rotationPoint?: ComponentUtilRotationPoint,
): boolean;

export function isValidLabel(text: unknown): boolean;

export function getSelfRefCoordinates(
  ctx: CanvasRenderingContext2D | undefined,
  angle: number,
  radius: number,
  node: any,
): { x: number; y: number };
