package com.example.tforwarder.forwarding

import com.example.tforwarder.data.local.AppDatabase
import com.example.tforwarder.telegram.TelegramClient
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ForwardingEngine(
    private val database: AppDatabase,
    private val ruleMatcher: RuleMatcher,
    private val messageProcessor: MessageProcessor,
    private val telegramClient: TelegramClient
) {
    private var engineJob: Job? = null
    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

    fun startListening() {
        if (_isRunning.value) return
        _isRunning.value = true

        engineJob = CoroutineScope(Dispatchers.IO).launch {
            try {
                telegramClient.incomingMessages.collect { incomingMsg ->
                    if (!_isRunning.value) return@collect

                    val activeRules = database.ruleDao().getActiveRulesSync()
                    val matchedRules = ruleMatcher.matchRulesForSource(incomingMsg.sourceChatId, activeRules)

                    for (rule in matchedRules) {
                        try {
                            messageProcessor.processIncomingMessage(incomingMsg, rule)
                        } catch (e: Exception) {
                            // Log unexpected exception without crashing engine loop
                        }
                    }
                }
            } catch (e: CancellationException) {
                // Cooperative cancellation
            } catch (e: Exception) {
                // Connection or unexpected error
            } finally {
                _isRunning.value = false
            }
        }
    }

    fun stopListening() {
        _isRunning.value = false
        engineJob?.cancel()
        engineJob = null
    }
}
