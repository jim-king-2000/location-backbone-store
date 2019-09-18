import { observable } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { TsdbClient } from 'location-backbone-sdk';
import { appId, authorization } from './account';
import { toTimestamp, today } from './common/utils';
import { coordinateTransform } from './common/coordinate';

const tsdbClient = new TsdbClient();

function transform(splittedTrack, targetCoordinateType) {
  return splittedTrack.map(
    track => track.map(
      p => coordinateTransform(p, targetCoordinateType)));
}

async function getTrackSplit(vehicles, timeRange, targetCoordinateType) {
  const vehiclesEnabled = vehicles.filter(v => v.enabled);
  return Promise.all(vehiclesEnabled.map(async (v, i) => ({
    ...v,
    colorIndex: i,
    splittedTrack: transform(await tsdbClient.getTrackSplit({
      appId,
      thingId: v.thingId,
      authorization,
      start: toTimestamp(timeRange.startTime),
      end: toTimestamp(timeRange.endTime)
    }), targetCoordinateType)
  })));
}

export class TrackStore {
  constructor(vehicles, properties, targetCoordinateType = 'gcj-02') {
    this.vehicles = vehicles;
    if (Array.isArray(properties)) {
      properties.forEach(p => this[p.name] = promisedComputed(
        new p.type([]),
        async () => new p.type(this.tracks.get(), this.timeRange)))
    }
    this.targetCoordinateType = targetCoordinateType;
  }

  set = (vehicles, timeRange) => {
    this.vehicles = vehicles;
    this.timeRange = timeRange;
    this.setFitView = true;
  }

  tracks = promisedComputed([], async () => getTrackSplit(
    this.vehicles,
    this.timeRange,
    this.targetCoordinateType));

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