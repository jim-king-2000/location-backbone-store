import { observable } from 'mobx';

export class TrackPlayerStore {
  constructor(tracks) {
    this.tracks = tracks.map(t => ({
      name: t.name,
      thingId: t.thingId,
      tracks: t.splittedTrack.flat()
    }));
  }

  @observable tracks = [];
}