package com.example.tforwarder.forwarding

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.tforwarder.TForwarderApp
import com.example.tforwarder.security.SecureStorage

class RecoveryWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            val app = applicationContext as TForwarderApp
            val secureStorage = SecureStorage(applicationContext)

            // 1. Purge logs older than 30 days to save device storage
            val thirtyDaysAgo = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000)
            app.container.database.messageLogDao().deleteLogsOlderThan(thirtyDaysAgo)
            app.container.database.processedMessageDao().purgeOldProcessedRecords(thirtyDaysAgo)

            // 2. If service should be running and user is logged in, ensure service is alive
            if (secureStorage.isServiceEnabled && !secureStorage.sessionToken.isNullOrEmpty()) {
                ForwardingService.start(applicationContext)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
