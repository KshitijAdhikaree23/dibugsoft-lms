import { errorActions, entitlementActions } from '../constants/actionTypes';

// eslint-disable-next-line default-param-last
const error = (state = '', action) => {
    switch (action.type) {
    case errorActions.DISPLAY_ERROR:
        return action.error;
    case errorActions.DISMISS_ERROR:
    case entitlementActions.fetch.SUCCESS:
        return '';
    default:
        return state;
    }
};

export default error;
