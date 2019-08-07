import { observable, autorun, computed } from 'mobx';
import io from 'socket.io-client';
import { coordinateTransform } from '../common/coordinate';
import { getEnabledThingIds, onConnect, onMessage,
  getPositions, calcOnline, refreshSelectedVehicle } from './PositionStoreUtil';

export class PositionStore {
  constructor(vehicles, colorIndex, url) {
    this.colorIndex = colorIndex;
    this.vehicles = vehicles;

    autorun(async () => {
      const checkedVehicles = this.vehicles.filter(v => v.enabled);
      if (!this.colorIndex) {
        checkedVehicles.forEach((v, i) => v.colorIndex = i);
      } else {
        checkedVehicles.forEach(
          v => v.colorIndex = this.colorIndex.get(v.groupId));
      }
      const positions = await getPositions(checkedVehicles);
      console.log(positions);
      this.positionIndex = new Map(positions.map((p, i) => [p.thingId, i]));
      calcOnline(positions);
      positions.forEach(p => coordinateTransform(p));
      this.positions = positions;
    });

    if (typeof window !== 'undefined') {
      setInterval(() => calcOnline(this.positions), 5000);
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

      this.setVehicles = (vehicles, colorIndex) => {
        this.colorIndex = colorIndex;
        socket.send({ unsub: getEnabledThingIds(this.vehicles) });
        this.vehicles = vehicles;
        socket.send({ sub: getEnabledThingIds(this.vehicles) });
      }
    }
  }
  
  @computed
  get selectedVehicle() {
    return refreshSelectedVehicle(
      this.selectedThingId,
      this.positionIndex,
      this.positions);
  }

  @observable vehicles = [];
  @observable positions = [];
  @observable colorIndex;
  @observable selectedThingId;
}