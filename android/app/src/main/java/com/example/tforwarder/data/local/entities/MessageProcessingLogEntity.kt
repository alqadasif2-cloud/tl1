package com.example.tforwarder.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

enum class ProcessingStatus {
    SUCCESS,
    FILTERED_OUT,
    FAILED,
    DUPLICATE_SKIPPED,
    PENDING_RETRY
}

@Entity(
    tableName = "message_processing_logs",
    indices = [
        Index("ruleId"),
        Index("sourceChatId"),
        Index("destinationChatId"),
        Index("processingStatus"),
        Index("createdAt")
    ]
)
data class MessageProcessingLogEntity(
    @PrimaryKey
    val id: String,
    val ruleId: String,
    val ruleName: String,
    val sourceChatId: String,
    val sourceChatName: String,
    val sourceMessageId: Long,
    val destinationChatId: String,
    val destinationChatName: String,
    val destinationMessageId: Long? = null,
    val messageType: String,             // TEXT, PHOTO, VIDEO, DOCUMENT, etc.
    val originalPreview: String,
    val transformedPreview: String? = null,
    val processingStatus: ProcessingStatus,
    val errorCode: String? = null,
    val errorMessage: String? = null,
    val errorStackTrace: String? = null,
    val filterReason: String? = null,
    val attempts: Int = 1,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null
)

@Entity(
    tableName = "processed_messages",
    primaryKeys = ["sourceChatId", "sourceMessageId", "destinationChatId", "ruleId"]
)
data class ProcessedMessageEntity(
    val sourceChatId: String,
    val sourceMessageId: Long,
    val destinationChatId: String,
    val ruleId: String,
    val messageHash: String,
    val processingStatus: ProcessingStatus,
    val firstProcessedAt: Long = System.currentTimeMillis(),
    val lastAttemptAt: Long = System.currentTimeMillis()
)
