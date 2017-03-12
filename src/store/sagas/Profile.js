import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';
import pick from 'lodash/fp/pick';
import get from 'lodash/fp/get';
import flow from 'lodash/fp/flow';
import api from 'store/api';
import {getFromCache} from 'store/reducers/Profile';

const pickProfileData = flow(
  get('data'),
  pick([
    'avatar_url',
    'bio',
    'blog',
    'company',
    'followers',
    'followers_url',
    'following',
    'html_url',
    'location',
    'login',
    'name',
    'public_gists',
    'public_repos',
    'repos_url',
  ])
);

function* requestAdditionalProfileData(data) {
  yield put({
    type: 'REPOS_REQUEST',
    url: data.repos_url,
  });
  yield put({
    type: 'FOLLOWERS_REQUEST',
    url: data.followers_url,
  });
}

export function* getProfile({username}) {
  const cachedProfile = yield select(getFromCache(username));
  let profile;

  if (cachedProfile) {
    profile = cachedProfile;
  } else {
    try {
      const response = yield call(api.getProfile, username);
      profile = pickProfileData(response);
    } catch (err) {
      yield put({
        type: 'PROFILE_FAILURE',
        message: err.message,
        response: err.response,
      });
    }
  }

  yield put({
    type: 'PROFILE_SUCCESS',
    profile,
  });
  yield* requestAdditionalProfileData(profile);
}

export function* watchGetProfile() {
  yield takeLatest('PROFILE_REQUEST', getProfile);
}