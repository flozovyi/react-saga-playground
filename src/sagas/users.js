import {takeEvery, takeLatest, call, fork, put, take} from 'redux-saga/effects';
import * as actions from '../actions/users';
import * as api from '../api/users';


function* getUsers() {
    try {
        const result = yield call(api.getUsers);
        yield put(actions.getUsersSuccess({items: result.data.data}))
    } catch (e) {
        yield put(actions.usersError({
            error: `An error occurred when tried to get the users`
        }))
    }
}

function* createUser(action) {
    try {
        yield call(api.createUser, {firstName: action.payload.firstName, lastName: action.payload.lastName});
        yield call(getUsers);
    } catch (e) {
        yield put(actions.usersError({
            error: `An error occurred when tried to create the user`
        }))
    }
}

function* deleteUser({userId}) {
    try {
        yield call(api.deleteUser, {userId});
        yield call(getUsers);
    } catch (e) {
        yield put(actions.usersError({
            error: `An error occurred when tried to delete the user`
        }))
    }
}

function* watchGetUsersRequest() {
    yield takeEvery(actions.Types.GET_USERS_REQUEST, getUsers)
}

function* watchCreateUserRequest() {
    yield takeLatest(actions.Types.CREATE_USER_REQUEST, createUser)
}

function* watchDeleteUserRequest() {
    //ignores all further requests until completes the whole loop
    while (true) {
        const action = yield take(actions.Types.DELETE_USER_REQUEST);
        yield call(deleteUser, {userId: action.payload.userId})
    }
}

const usersSagas = [
    fork(watchGetUsersRequest),
    fork(watchCreateUserRequest),
    fork(watchDeleteUserRequest)
];

export default usersSagas;
