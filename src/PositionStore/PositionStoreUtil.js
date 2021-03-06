import { TsdbClient } from 'location-backbone-sdk';
import { coordinateTransform } from '../common/coordinate';
import { appId, authorization } from '../account';

const tsdbClient = new TsdbClient();

export function getEnabledThingIds(vehicles) {
  const vehiclesEnabled = vehicles.filter(v => v.enabled);
  return vehiclesEnabled.map(v => v.thingId);
}

export function onConnect(vehicles, socket) {
  setTimeout(() => socket.send({ sub: getEnabledThingIds(vehicles) }), 1000);
  console.log('Socket.io connected.');
}

export function onMessage(data, index, positions, targetCoordinateType) {
  // console.log(data);
  const i = index.get(data.thingId);
  if (i === undefined) return;
  data.data.forEach(d => {
    Object.assign(positions[i], {
      ...positions[i],
      ...d,
      ...coordinateTransform(d.location, targetCoordinateType),
      ...d.sensors
    });
  });
}

export async function getPositions(vehicles) {
  return Promise.all(
    vehicles.map(async v => ({
      ...v,
      ...await tsdbClient.getLastPosition({
        appId,
        thingId: v.thingId,
        authorization })
    }))
  );
}

function isOnline(prevTimestamp) {
  return Date.now() - prevTimestamp < 20000;
}

export function calcOnline(positions) {
  positions.forEach(p => p.isOnline = isOnline(p.timestamp));
}

export function refreshSelectedVehicle(selectedThingId, index, positions) {
  if (!selectedThingId) return undefined;
  return positions[index.get(selectedThingId)];
}
