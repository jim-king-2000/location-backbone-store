import { observable, computed, autorun } from 'mobx';
import { calcPlayerTimestamp, calcPlayerIndex } from './TrackPlayerStoreUtil';

export class TrackPlayerStore {
  constructor(tracks, timeRange) {
    this.tracks = tracks.map(t => ({
      thingId: t.thingId,
      tracks: t.splittedTrack.flat()
    }));
    this.timeRange = timeRange;

    autorun(() => this.playerTimeline =
      calcPlayerTimestamp(this.tracks, this.timeRange));
  }

  @computed
  get things() {
    const tracks = calcPlayerIndex(
      this.tracks,
      this.playerTimeline.currentTimestamp);
    return tracks.map(t => t.tracks[t.index]);
  }

  @observable tracks = [];
  @observable timeRange = {};
  @observable playerTimeline = {};
}