import { observable } from 'mobx';

export class TrackPlayerStore {
  constructor(tracks) {
    this.tracks = tracks;
  }

  @observable tracks = [];
}