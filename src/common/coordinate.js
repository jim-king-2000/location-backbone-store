import { transform, WGS84, GCJ02, BD09 } from 'gcoord';

const TypeMap = new Map([
  ['wgs-84', WGS84],
  ['gcj-02', GCJ02],
  ['bd-09', BD09]
]);

function transformPoint(p, sourceCoordinateType, targetCoordinateType) {
  if (sourceCoordinateType === targetCoordinateType) return p;

  const [longitude, latitude] = transform(
    [p.longitude, p.latitude],
    TypeMap.get(sourceCoordinateType),
    TypeMap.get(targetCoordinateType)
  );
  p.longitude = longitude;
  p.latitude = latitude;
  return p;
}

export function coordinateTransform(p, targetCoordinateType = 'gcj-02') {
  let coordinateType = p.coordinateType || 'gcj-02';
  if (!TypeMap.get(coordinateType)) coordinateType = 'gcj-02';
  return transformPoint(p, coordinateType, targetCoordinateType);
}