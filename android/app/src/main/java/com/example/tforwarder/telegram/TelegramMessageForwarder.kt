package com.example.tforwarder.telegram

import com.example.tforwarder.core.AppResult
import com.example.tforwarder.filters.TelegramMessageType

interface TelegramMessageForwarder {
    suspend fun forwardMessage(
        sourceChatId: String,
        sourceMessageId: Long,
        destinationChatId: String
    ): AppResult<Long>

    suspend fun sendNewMessage(
        destinationChatId: String,
        text: String,
        mediaFileId: String? = null,
        mediaType: TelegramMessageType = TelegramMessageType.TEXT
    ): AppResult<Long>
}

data class TelegramChat(
    val id: String,
    val title: String,
    val type: String, // CHANNEL, SUPERGROUP, GROUP, PRIVATE
    val username: String? = null,
    val canPostMessages: Boolean = true,
    val memberCount: Int = 0,
    val photoUrl: String? = null
)

data class TelegramAuthState(
    val isAuthorized: Boolean = false,
    val phoneNumber: String? = null,
    val needsCode: Boolean = false,
    val needs2FA: Boolean = false,
    val userFirstName: String? = null,
    val userLastName: String? = null,
    val username: String? = null,
    val error: String? = null
)
