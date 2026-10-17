package com.example.tforwarder.filters

enum class TelegramMessageType {
    TEXT,
    PHOTO,
    VIDEO,
    DOCUMENT,
    AUDIO,
    VOICE,
    STICKER,
    ANIMATION,
    ALBUM
}

class MessageTypeFilter(
    private val allowTextOnly: Boolean,
    private val allowPhotos: Boolean,
    private val allowVideos: Boolean,
    private val allowDocuments: Boolean,
    private val allowAudio: Boolean,
    private val allowVoice: Boolean,
    private val allowLinks: Boolean,
    private val allowAlbums: Boolean
) {
    fun evaluate(type: TelegramMessageType, hasLinks: Boolean): FilterEvaluationResult {
        if (hasLinks && !allowLinks) {
            return FilterEvaluationResult(passed = false, reason = "Messages with links are disallowed")
        }

        val passed = when (type) {
            TelegramMessageType.TEXT -> allowTextOnly
            TelegramMessageType.PHOTO -> allowPhotos
            TelegramMessageType.VIDEO -> allowVideos
            TelegramMessageType.DOCUMENT -> allowDocuments
            TelegramMessageType.AUDIO -> allowAudio
            TelegramMessageType.VOICE -> allowVoice
            TelegramMessageType.ALBUM -> allowAlbums
            TelegramMessageType.STICKER, TelegramMessageType.ANIMATION -> false
        }

        return if (passed) {
            FilterEvaluationResult(passed = true)
        } else {
            FilterEvaluationResult(passed = false, reason = "Message type '$type' is not permitted by rule")
        }
    }
}
