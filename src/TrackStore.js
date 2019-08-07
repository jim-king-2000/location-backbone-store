import { observable } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { TsdbClient } from 'location-backbone-sdk';
import { appId, authorization } from './account';
import { toTimestamp, today } from './common/utils';

const tsdbClient = new TsdbClient();

async function getTrackSplit(vehicles, timeRange) {
  const vehiclesEnabled = vehicles.filter(v => v.enabled);
  return Promise.all(vehiclesEnabled.map(async (v, i) => ({
    thingId: v.thingId,
    name: v.thingName,
    colorIndex: i,
    splittedTrack: await tsdbClient.getTrackSplit({
      appId,
      thingId: v.thingId,
      authorization,
      start: toTimestamp(timeRange.startTime),
      end: toTimestamp(timeRange.endTime)
    })
  })));
}

export class TrackStore {
  constructor(vehicles, properties) {
    this.vehicles = vehicles;
    if (Array.isArray(properties)) {
      properties.forEach(p => this[p.name] = promisedComputed(
        new p.type([]),
        async () => new p.type(this.tracks.get(), this.timeRange)))
    }
  }

  set = (vehicles, timeRange) => {
    this.vehicles = vehicles;
    this.timeRange = timeRange;
  }

  tracks = promisedComputed([], async () => getTrackSplit(
    this.vehicles,
    this.timeRange));

  @observable vehicles = [];
  @observable timeRange = {
    startTime: {
      date: today(),
      time: '00:00'
    },
    endTime: {
      date: today(),
      time: '00:00'
    }
  };
}