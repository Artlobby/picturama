import processDates from './../lib/process-dates';
import updatePhotos from './../lib/update-photos';

const processTags = (prevTags, nextTags) => {
  let tags = nextTags.map((nextTag) => {
    let exists = false;

    prevTags.forEach((prevTag) => {
      if (nextTag.slug == prevTag.slug)
        exists = true;
    });

    return (!exists) ? nextTag : null;
  })
  .filter((tag) => tag);

  return (tags.length > 0) ? prevTags.concat(tags) : [];
};

const rmDevice = (devices, rmDevice) => {
  let pos = -1;

  devices.forEach((device, index) => {
    if (device.id == rmDevice.id)
      pos = index;
  });

  return [
    ...devices.slice(0, pos),
    ...devices.slice(pos + 1)
  ];
};

const initialState = {
  importing: false,
  currentDate: null,
  photos: [],
  tags: [],
  devices: [],
  dates: { years: [] },
  progress: { processed: 0, total: 0 }
};

export default function reducers(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return {
      ...state,
      importing: false,
      currentDate: action.hasOwnProperty('date') ? action.date : null,
      photos: action.photos.map(function(photo) {
        photo.versionNumber = 1;

        if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
          photo.versionNumber = 1 + photo.versions.length;

          let lastVersion = photo.versions[photo.versions.length - 1];

          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
        }

        return photo;
      })
    };

  case 'UPDATED_PHOTO_SUCCESS':
    return {
      ...state,
      photos: updatePhotos(state.photos, action.photo)
    };

  case 'GET_DATES_SUCCESS':
    return {
      ...state,
      dates: processDates(action.dates)
    };

  case 'SET_IMPORT':
    return {
      ...state,
      importing: action.status
    };

  case 'SET_IMPORT_PROGRESS':
    return {
      ...state,
      progress: action.progress
    };

  case 'GET_TAGS_SUCCESS':
    return {
      ...state,
      tags: action.tags
    };

  case 'CREATE_TAGS_SUCCESS':
    return {
      ...state,
      tags: processTags(state.tags, action.tags)
    };

  case 'INIT_DEVICES_SUCCESS':
    return {
      ...state,
      devices: action.devices
    };

  case 'ADD_DEVICE_SUCCESS':
    return {
      ...state,
      devices: [
        ...state.devices,
        action.device
      ]
    };

  case 'REMOVE_DEVICE_SUCCESS':
    return {
      ...state,
      devices: rmDevice(state.devices, action.device)
    };

  default:
    return state;
  }
}
