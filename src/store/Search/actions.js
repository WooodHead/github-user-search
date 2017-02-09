// @flow

import get from 'lodash/fp/get';
import {normalize} from 'normalizr';
import userSchema from '../schema';

function getQueryFromCache(query: string, state: Object): Array<number> | void {
  return get('search.cache', state)[query];
}

export function searchUser({query}: {query: string}) {
  return function (dispatch: Function, getState: Function, api: Object) {
    const cachedQuery = getQueryFromCache(query, getState());
    if (cachedQuery) {
      return Promise
        .resolve()
        .then(() => dispatch(searchSuccess({result: cachedQuery}, query)));
    }

    dispatch(searchRequest({query}));

    return api
      .searchUsers({q: query})
      .then(response => normalize(response.items, userSchema))
      .then(response => dispatch(searchSuccess(response, query)))
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
export function searchSuccess(data: Object, query: string) {
  const {result, entities} = data;
  return {
    entities,
    userIds: result,
    query,
    type: SEARCH_SUCCESS,
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
