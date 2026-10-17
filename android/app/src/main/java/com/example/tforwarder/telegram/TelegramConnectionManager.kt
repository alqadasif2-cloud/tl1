package com.example.tforwarder.telegram

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class ConnectionStatus {
    CONNECTED,
    CONNECTING,
    DISCONNECTED,
    WAITING_FOR_NETWORK
}

class TelegramConnectionManager(context: Context) {

    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val _status = MutableStateFlow(
        if (isCurrentlyOnline(connectivityManager)) ConnectionStatus.CONNECTED else ConnectionStatus.WAITING_FOR_NETWORK
    )
    val status: StateFlow<ConnectionStatus> = _status.asStateFlow()

    init {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        connectivityManager.registerNetworkCallback(request, object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _status.value = ConnectionStatus.CONNECTED
            }

            override fun onLost(network: Network) {
                _status.value = ConnectionStatus.WAITING_FOR_NETWORK
            }
        })
    }

    private fun isCurrentlyOnline(cm: ConnectivityManager): Boolean {
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
