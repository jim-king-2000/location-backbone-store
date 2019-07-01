import { observable, computed, autorun } from 'mobx';
import { calcPlayerTimestamp, calcPlayerIndex,
  percentize } from './TrackPlayerStoreUtil';

export class TrackPlayerStore {
  constructor(tracks, timeRange) {
    this.tracks = tracks.map(t => ({
      thingId: t.thingId,
      colorIndex: t.colorIndex,
      tracks: t.splittedTrack.flat(),
      splittedTrack: t.splittedTrack
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

  @computed
  get visualization() {
    const range = playerTimeline.endTimestamp - playerTimeline.startTimestamp;
    return this.tracks.map(t => {
      if (!range || range < 0) return [];
      const dataSegments = t.splittedTrack.map(track => ({
        start: track[0].timestamp,
        end: track[track.length - 1].timestamp
      }));
      return dataSegments.map(dataSegment => ({
        margin: percentize(
          (dataSegment.start - playerTimeline.startTimestamp) / sum),
        width: percentize(
          (dataSegment.end - dataSegment.start) / sum)
      }));
    });
  }

  @observable tracks = [];
  @observable timeRange = {};
  @observable playerTimeline = {};
}