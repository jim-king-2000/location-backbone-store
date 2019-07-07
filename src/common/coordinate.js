import { transform, WGS84, GCJ02, BD09 } from 'gcoord';

function transformPoint(p, sourceCoordinateType) {
  const [longitude, latitude] = transform(
    [p.longitude, p.latitude],
    sourceCoordinateType,
    GCJ02
  );
  p.longitude = longitude;
  p.latitude = latitude;
}

export function coordinateTransform(p) {
  if (p.coordinateType === 'wgs-84') {
    transformPoint(p, WGS84);
  } else if (p.coordinateType === 'bd-09') {
    transformPoint(p, BD09)
  }

  return p;
}