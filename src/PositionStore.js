import { observable, autorun } from 'mobx';
import io from 'socket.io-client';
import { TsdbClient } from 'location-backbone-sdk';
import { appId, authorization } from './account';

const tsdbClient = new TsdbClient();

function getEnabledThingIds(vehicles) {
  const vehiclesEnabled = vehicles.filter(v => v.enabled);
  return vehiclesEnabled.map(v => v.thingId);
}

function onConnect(vehicles, socket) {
  setTimeout(() => socket.send({ sub: getEnabledThingIds(vehicles) }), 1000);
  console.log('Socket.io connected.');
}

function onMessage(data, index, positions) {
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

async function getPositions(vehicles) {
  return Promise.all(
    vehicles.map(async (v, i) => ({
      ...v,
      colorIndex: i,
      ...await tsdbClient.getLastPosition({
        appId,
        thingId: v.thingId,
        authorization })
    }))
  );
}

export class PositionStore {
  constructor(vehicles, url) {
    this.vehicles = vehicles;

    autorun(async () => {
      const checkedVehicles = this.vehicles.filter(v => v.enabled);
      const positions = await getPositions(checkedVehicles);
      this.positionIndex = new Map(positions.map((p, i) => [p.thingId, i]));
      this.positions = positions;
    });

    if (typeof window !== 'undefined') {
      const socket = io(
        url || 'https://locationbackbone.top',
        { transports: [ 'websocket' ] });
      socket.on('connect', () => onConnect(this.vehicles, socket));
      socket.on('message',
        data => onMessage(
          data,
          this.positionIndex,
          this.positions));

      this.pickVehicle = (v, checked) => {
        v.enabled = checked;
        socket.send(checked ? { sub: [v.thingId] } : { unsub: [v.thingId] });
      }

      this.setVehicles = vehicles => {
        socket.send({ unsub: getEnabledThingIds(this.vehicles) });
        this.vehicles = vehicles;
        socket.send({ sub: getEnabledThingIds(this.vehicles) });
      }
    }
  }

  @observable vehicles = [];
  @observable positions = [];
}