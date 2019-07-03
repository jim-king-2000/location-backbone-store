import { TsdbClient } from 'location-backbone-sdk';
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

export function onMessage(data, index, positions) {
  console.log(data);
  const i = index.get(data.thingId);
  if (i === undefined) return;
  data.data.forEach(d => {
    positions[i] = {
      ...positions[i],
      ...d,
      ...d.location,
      ...d.sensors
    };
  });
}

export async function getPositions(vehicles) {
  return Promise.all(
    vehicles.map(async (v, i) => (
      v.enabled ? {
        ...v,
        colorIndex: i,
        ...await tsdbClient.getLastPosition({
          appId,
          thingId: v.thingId,
          authorization })
      } : {
        ...v,
        colorIndex: i
      })
    )
  );
}

function isOnline(prevTimestamp) {
  return Date.now() - prevTimestamp < 10000;
}

export function calcOnline(positions) {
  positions.forEach(p => p.isOnline = isOnline(p.timestamp));
}