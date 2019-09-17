import { transform, WGS84, GCJ02, BD09 } from 'gcoord';

function transformPoint(p, sourceCoordinateType, targetCoordinateType = GCJ02) {
  const [longitude, latitude] = transform(
    [p.longitude, p.latitude],
    sourceCoordinateType,
    targetCoordinateType
  );
  p.longitude = longitude;
  p.latitude = latitude;
}

export function coordinateTransform(p, targetCoordinateType = GCJ02) {
  if (p.coordinateType === 'wgs-84') {
    transformPoint(p, WGS84, targetCoordinateType);
  } else if (p.coordinateType === 'bd-09') {
    transformPoint(p, BD09, targetCoordinateType)
  }

  return p;
}