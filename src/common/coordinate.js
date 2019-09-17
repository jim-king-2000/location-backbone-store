import { transform, WGS84, GCJ02, BD09 } from 'gcoord';

const TypeMap = new Map([
  ['wgs-84', WGS84],
  ['gcj-02', GCJ02],
  ['bd-09', BD09]
]);

function transformPoint(p, sourceCoordinateType, targetCoordinateType) {
  const [longitude, latitude] = transform(
    [p.longitude, p.latitude],
    sourceCoordinateType,
    TypeMap.get(targetCoordinateType)
  );
  p.longitude = longitude;
  p.latitude = latitude;
}

export function coordinateTransform(p, targetCoordinateType = 'gcj-02') {
  if (p.coordinateType === 'wgs-84') {
    transformPoint(p, WGS84, targetCoordinateType);
  } else if (p.coordinateType === 'bd-09') {
    transformPoint(p, BD09, targetCoordinateType)
  }

  return p;
}