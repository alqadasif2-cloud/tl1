package com.example.tforwarder.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters

enum class ForwardingMode {
    NATIVE_FORWARD,     // Keeps original Telegram author/channel attribution
    COPY_CONTENT,       // Sends message as a brand-new message, allowing text modification
    COPY_WITHOUT_AUTHOR // Sends copy without author tag
}

@Entity(tableName = "forwarding_rules")
data class ForwardingRuleEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val isEnabled: Boolean = true,
    val sourceChatIds: String,       // Comma-separated or JSON array of chat IDs
    val destinationChatIds: String,  // Comma-separated or JSON array of chat IDs
    val sourceChatNames: String = "",
    val destinationChatNames: String = "",
    
    // Filters configuration
    val includeKeywords: String = "",   // Comma-separated
    val excludeKeywords: String = "",   // Comma-separated
    val matchAllKeywords: Boolean = false,
    val caseSensitiveKeywords: Boolean = false,
    val regexPattern: String = "",
    val regexFlags: String = "i",       // i = case insensitive
    
    // Media conditions
    val allowTextOnly: Boolean = true,
    val allowPhotos: Boolean = true,
    val allowVideos: Boolean = true,
    val allowDocuments: Boolean = true,
    val allowAudio: Boolean = true,
    val allowVoice: Boolean = true,
    val allowLinks: Boolean = true,
    val allowAlbums: Boolean = true,

    // Transformation pipeline (JSON)
    val transformationsJson: String = "[]",
    val prefixText: String = "",
    val suffixText: String = "",
    val removeLinks: Boolean = false,
    val trimExtraLines: Boolean = true,
    val removeCustomSignatures: String = "",
    val appendSourceTimestamp: Boolean = false,

    // Execution mode & Stats
    val forwardingMode: ForwardingMode = ForwardingMode.COPY_CONTENT,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val lastSuccessfulExecution: Long? = null,
    val totalProcessedCount: Int = 0,
    val totalForwardedCount: Int = 0,
    val totalFailedCount: Int = 0
)
