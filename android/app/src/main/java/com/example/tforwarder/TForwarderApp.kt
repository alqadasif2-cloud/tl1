package com.example.tforwarder

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.example.tforwarder.core.AppContainer

class TForwarderApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        container = AppContainer(this)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val forwardingChannel = NotificationChannel(
                CHANNEL_FORWARDING_SERVICE,
                getString(R.string.channel_service_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_service_desc)
                setShowBadge(false)
            }

            val alertsChannel = NotificationChannel(
                CHANNEL_ALERTS,
                getString(R.string.channel_alerts_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = getString(R.string.channel_alerts_desc)
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(forwardingChannel)
            manager.createNotificationChannel(alertsChannel)
        }
    }

    companion object {
        const val CHANNEL_FORWARDING_SERVICE = "channel_tforwarder_service"
        const val CHANNEL_ALERTS = "channel_tforwarder_alerts"

        lateinit var instance: TForwarderApp
            private set
    }
}
