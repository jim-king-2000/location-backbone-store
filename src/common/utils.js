import moment from 'moment';

export function toTimestamp(dateTime) {
  return moment(`${dateTime.date}T${dateTime.time}:00+08:00`).valueOf();
}