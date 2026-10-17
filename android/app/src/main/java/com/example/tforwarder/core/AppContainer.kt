package com.example.tforwarder.core

import android.content.Context
import com.example.tforwarder.data.local.AppDatabase
import com.example.tforwarder.forwarding.DuplicateDetector
import com.example.tforwarder.forwarding.ForwardingEngine
import com.example.tforwarder.forwarding.MessageProcessor
import com.example.tforwarder.forwarding.RuleMatcher
import com.example.tforwarder.security.SecureStorage
import com.example.tforwarder.telegram.TelegramClient
import com.example.tforwarder.telegram.TelegramConnectionManager
import com.example.tforwarder.telegram.TelegramSessionManager

class AppContainer(private val context: Context) {

    val database: AppDatabase by lazy {
        AppDatabase.getInstance(context)
    }

    val secureStorage: SecureStorage by lazy {
        SecureStorage(context)
    }

    val sessionManager: TelegramSessionManager by lazy {
        TelegramSessionManager(secureStorage)
    }

    val connectionManager: TelegramConnectionManager by lazy {
        TelegramConnectionManager(context)
    }

    val telegramClient: TelegramClient by lazy {
        TelegramClient(context, sessionManager, connectionManager)
    }

    val duplicateDetector: DuplicateDetector by lazy {
        DuplicateDetector(database.processedMessageDao())
    }

    val ruleMatcher: RuleMatcher by lazy {
        RuleMatcher()
    }

    val messageProcessor: MessageProcessor by lazy {
        MessageProcessor(
            ruleDao = database.ruleDao(),
            messageLogDao = database.messageLogDao(),
            duplicateDetector = duplicateDetector,
            messageForwarder = telegramClient
        )
    }

    val forwardingEngine: ForwardingEngine by lazy {
        ForwardingEngine(
            database = database,
            ruleMatcher = ruleMatcher,
            messageProcessor = messageProcessor,
            telegramClient = telegramClient
        )
    }
}
