import { observable, computed, autorun } from 'mobx';
import { calcPlayerTimestamp, calcPlayerIndex } from './TrackPlayerStoreUtil';

export class TrackPlayerStore {
  constructor(tracks, timeRange) {
    this.tracks = tracks.map((t, i) => ({
      thingId: t.thingId,
      colorIndex: i,
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
    return tracks.map(t => ({
      ...t.tracks[t.index],
      colorIndex: t.colorIndex
    }));
  }

  @observable tracks = [];
  @observable timeRange = {};
  @observable playerTimeline = {};
}