import { observable } from 'mobx';

export class TrackPlayerStore {
  constructor(tracks) {
    this.tracks = tracks.map(t => ({
      thingId: t.thingId,
      tracks: t.splittedTrack.flat()
    }));
  }

  @observable tracks = [];
}