import { observable, autorun } from 'mobx';
import io from 'socket.io-client';
import { getEnabledThingIds, onConnect, onMessage,
  getPositions, calcOnline, refreshSelectedVehicle } from './PositionStoreUtil';

export class PositionStore {
  constructor(vehicles, url) {
    this.vehicles = vehicles;

    autorun(async () => {
      const checkedVehicles = this.vehicles.filter(v => v.enabled);
      const positions = await getPositions(checkedVehicles);
      this.positionIndex = new Map(positions.map((p, i) => [p.thingId, i]));
      calcOnline(positions);

      // 以下两行位置不可以交换，否则数组proxy赋值会生成元素的拷贝，导致
      // selectedVehicle和this.positions[i]指向不同的对象。这会使得单车窗口
      // 停止跟随车辆移动。
      this.positions = positions;
      this.selectedVehicle = refreshSelectedVehicle(
        this.selectedVehicle,
        this.positionIndex,
        this.positions);
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

      this.setVehicles = vehicles => {
        socket.send({ unsub: getEnabledThingIds(this.vehicles) });
        this.vehicles = vehicles;
        socket.send({ sub: getEnabledThingIds(this.vehicles) });
      }
    }
  }

  @observable vehicles = [];
  @observable positions = [];
  @observable selectedVehicle;
}