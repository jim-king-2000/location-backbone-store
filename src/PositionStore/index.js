import { observable, autorun } from 'mobx';
import io from 'socket.io-client';
import { getEnabledThingIds, onConnect, onMessage,
  getPositions, calcOnline } from './PositionStoreUtil';

export class PositionStore {
  constructor(vehicles, url) {
    this.vehicles = vehicles;

    autorun(async () => {
      const checkedVehicles = this.vehicles.filter(v => v.enabled);
      const positions = await getPositions(checkedVehicles);
      this.positionIndex = new Map(positions.map((p, i) => [p.thingId, i]));
      calcOnline(positions);
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