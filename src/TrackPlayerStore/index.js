import { observable, computed, autorun } from 'mobx';
import { calcPlayerTimestamp, calcPlayerIndex,
  visualize, refreshSelectedVehicle } from './TrackPlayerStoreUtil';

export class TrackPlayerStore {
  constructor(tracks, timeRange) {
    this.tracks = tracks.map(t => ({
      thingId: t.thingId,
      name: t.name,
      colorIndex: t.colorIndex,
      tracks: t.splittedTrack.flat(),
      splittedTrack: t.splittedTrack
    }));
    this.timeRange = timeRange;

    autorun(() => this.playerTimeline =
      calcPlayerTimestamp(this.tracks, this.timeRange));
    autorun(() => {
      const x = refreshSelectedVehicle(
        this.selectedVehicle,
        this.things
      );
      console.log(x);
      this.selectedVehicle = x;
    });
  }

  @computed
  get things() {
    const tracks = calcPlayerIndex(
      this.tracks,
      this.playerTimeline.currentTimestamp);
    return tracks.map(t => ({
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
  @observable selectedVehicle;
}