// @flow

import pick from 'lodash/fp/pick';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import mapValues from 'lodash/fp/mapValues';
import assignAll from 'lodash/fp/assignAll';
import {normalize} from 'normalizr';
import userListSchema from '../schema';

const getUserEntities = get('entities.users');
const pickUserData = flow(
  getUserEntities,
  mapValues(
    pick([
      'login',
      'id',
      'avatar_url',
    ])
  )
);

function createEntitiesObject(users: Object) {
  return {
    entities: {users},
  };
}

function transformEntities(data) {
  return assignAll([
    data,
    flow(pickUserData, createEntitiesObject)(data),
  ]);
}

export function searchUser({query}: {query: string}) {
  return function (dispatch: Function, getState: Function, api: Object) {
    dispatch(searchRequest({query}));

    return api
      .search({q: query})
      .forUsers()
      .then(response => normalize(response.data, userListSchema))
      .then(transformEntities)
      .then(response => dispatch(searchSuccess(response)))
      .catch(err => dispatch(searchFailure(err)));
  };
}

export const SEARCH_REQUEST: string = 'SEARCH_REQUEST';
export function searchRequest({query}: {query: string}) {
  return {
    type: SEARCH_REQUEST,
    query,
  };
}

export const SEARCH_SUCCESS: string = 'SEARCH_SUCCESS';
export function searchSuccess(data: Object) {
  const {result, entities} = data;
  return {
    entities,
    type: SEARCH_SUCCESS,
    result,
  };
}

export const SEARCH_FAILURE: string = 'SEARCH_FAILURE';
export function searchFailure(error: Object) {
  const {response, message} = error;
  return {
    type: SEARCH_FAILURE,
    response,
    message,
  };
}