import { observable, computed, autorun } from 'mobx';
import flatShim from 'array.prototype.flat/shim';
import { calcPlayerTimestamp, calcPlayerIndex,
  visualize, refreshSelectedVehicle } from './TrackPlayerStoreUtil';

flatShim();

export class TrackPlayerStore {
  constructor(tracks, timeRange) {
    this.tracks = tracks.map(t => ({
      ...t,
      tracks: t.splittedTrack.flat(),
    }));
    this.timeRange = timeRange;

    autorun(() =>
      this.playerTimeline = calcPlayerTimestamp(this.tracks, this.timeRange)
    );
  }

  @computed
  get selectedVehicle() {
    return refreshSelectedVehicle(
      this.selectedThingId,
      this.things
    )
  }

  @computed
  get things() {
    const tracks = calcPlayerIndex(
      this.tracks,
      this.playerTimeline.currentTimestamp);
    return tracks.map(t => ({
      ...t,
      ...t.tracks[t.index],
      colorIndex: t.colorIndex
    }));
  }

  @computed
  get visualization() {
    const startTimestamp = this.playerTimeline.startTimestamp;
    const endTimestamp = this.playerTimeline.endTimestamp;
    const range = endTimestamp - startTimestamp;
    return this.tracks.map(t => {
      return {
        thingId: t.thingId,
        name: t.name,
        visualData: visualize(
          startTimestamp,
          range,
          t.splittedTrack
        )
      };
    });
  }

  @observable tracks = [];
  @observable timeRange = {};
  @observable playerTimeline = {};
  @observable selectedThingId;
}