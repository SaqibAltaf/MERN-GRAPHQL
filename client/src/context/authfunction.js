function login(userData) {
    localStorage.setItem('jwtToken', userData.token);
    dispatch({
        type: 'LOGIN',
        payload: userData
    });
}

function logout() {
    localStorage.removeItem('jwtToken');
    dispatch({ type: 'LOGOUT' });
}

export {
    login,
    logout
}