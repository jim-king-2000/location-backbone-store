import assert from 'assert';
import { toTimestamp } from '../common/utils';

export function calcPlayerTimestamp(tracks, timeRange) {
  if (!Array.isArray(tracks) || 0 === tracks.length) return {
    startTimestamp: 0,
    endTimestamp: 0,
    currentTimestamp: 0
  };

  let timestamps = tracks.map(track =>
    track.tracks[0] && track.tracks[0].timestamp).filter(Boolean);
  if (!Array.isArray(timestamps) || 0 === timestamps.length) return {
    startTimestamp: 0,
    endTimestamp: 0,
    currentTimestamp: 0
  };

  const currentTimestamp = Math.min(...timestamps);
  const startTimestamp = toTimestamp(timeRange.startTime);
  const endTimestamp = toTimestamp(timeRange.endTime);
  return {
    startTimestamp,
    endTimestamp,
    currentTimestamp,
  };
}

// return the last index whose timestamp is less then
// parameter "timestamp"
function forwardIndex(tracks, timestamp, prevIndex) {
  const length = tracks.length;
  if (length < 1) return 0;

  if (timestamp < tracks[prevIndex].timestamp) prevIndex = 0;
  
  let index = prevIndex;
  for (; index < length; ++index) {
    if (timestamp < tracks[index].timestamp) return index;
  }
  assert(index >= 0 && index <= length);
  return index - 1;
}

export function calcPlayerIndex(tracks, timestamp) {
  return tracks.map(t => ({
    tracks: t.tracks,
    index: forwardIndex(
      t.tracks,
      timestamp,
      t.index || 0
    )}
  ));
}