package com.example.tforwarder.telegram

import com.example.tforwarder.security.SecureStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TelegramSessionManager(private val secureStorage: SecureStorage) {

    private val _authState = MutableStateFlow(
        TelegramAuthState(
            isAuthorized = !secureStorage.sessionToken.isNullOrEmpty(),
            phoneNumber = secureStorage.userPhone,
            userFirstName = secureStorage.userFullName,
            username = secureStorage.userUsername
        )
    )
    val authState: StateFlow<TelegramAuthState> = _authState.asStateFlow()

    fun updateAuthState(state: TelegramAuthState) {
        _authState.value = state
        if (state.isAuthorized) {
            secureStorage.userPhone = state.phoneNumber
            secureStorage.userFullName = listOfNotNull(state.userFirstName, state.userLastName).joinToString(" ")
            secureStorage.userUsername = state.username
        }
    }

    fun saveSessionToken(token: String) {
        secureStorage.sessionToken = token
    }

    fun logout() {
        secureStorage.clearSession()
        _authState.value = TelegramAuthState(isAuthorized = false)
    }

    val isConfigured: Boolean
        get() = secureStorage.apiId != 0 && !secureStorage.apiHash.isNullOrEmpty()
}
