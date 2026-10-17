package com.example.tforwarder.forwarding

import com.example.tforwarder.data.local.ProcessedMessageDao
import com.example.tforwarder.data.local.entities.ProcessedMessageEntity
import com.example.tforwarder.data.local.entities.ProcessingStatus
import java.security.MessageDigest

class DuplicateDetector(
    private val processedMessageDao: ProcessedMessageDao
) {
    suspend fun isDuplicate(
        sourceChatId: String,
        sourceMessageId: Long,
        destinationChatId: String,
        ruleId: String,
        contentBody: String
    ): Boolean {
        // 1. Direct key check (sourceChatId + sourceMessageId + destinationChatId + ruleId)
        val existing = processedMessageDao.findProcessed(
            sourceChatId = sourceChatId,
            sourceMessageId = sourceMessageId,
            destinationChatId = destinationChatId,
            ruleId = ruleId
        )

        if (existing != null && existing.processingStatus == ProcessingStatus.SUCCESS) {
            return true
        }

        // 2. Hash-based check within a 10-minute window to avoid duplicate media / rebroadcasts
        val contentHash = computeHash("$sourceChatId:$contentBody")
        val tenMinutesAgo = System.currentTimeMillis() - (10 * 60 * 1000)
        val hashDuplicate = processedMessageDao.findByHash(
            hash = contentHash,
            destinationChatId = destinationChatId,
            sinceTimestamp = tenMinutesAgo
        )

        return hashDuplicate != null
    }

    suspend fun recordProcessed(
        sourceChatId: String,
        sourceMessageId: Long,
        destinationChatId: String,
        ruleId: String,
        contentBody: String,
        status: ProcessingStatus
    ) {
        val hash = computeHash("$sourceChatId:$contentBody")
        processedMessageDao.markProcessed(
            ProcessedMessageEntity(
                sourceChatId = sourceChatId,
                sourceMessageId = sourceMessageId,
                destinationChatId = destinationChatId,
                ruleId = ruleId,
                messageHash = hash,
                processingStatus = status,
                lastAttemptAt = System.currentTimeMillis()
            )
        )
    }

    private fun computeHash(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
