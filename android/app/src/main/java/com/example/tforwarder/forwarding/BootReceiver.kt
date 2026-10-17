package com.example.tforwarder.forwarding

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.tforwarder.security.SecureStorage

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            val secureStorage = SecureStorage(context)
            // If the user previously had the forwarding service enabled, restart it on boot
            if (secureStorage.isServiceEnabled && !secureStorage.sessionToken.isNullOrEmpty()) {
                ForwardingService.start(context)
            }
        }
    }
}
