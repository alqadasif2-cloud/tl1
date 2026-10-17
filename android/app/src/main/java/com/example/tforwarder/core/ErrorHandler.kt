package com.example.tforwarder.core

enum class ErrorSeverity {
    RETRYABLE,
    USER_ACTION_REQUIRED,
    PERMANENT
}

data class CategorizedError(
    val code: String,
    val message: String,
    val severity: ErrorSeverity,
    val suggestedAction: String
)

object ErrorHandler {
    fun categorize(error: Throwable, code: String? = null): CategorizedError {
        val msg = error.message ?: "Unknown error"
        return when {
            msg.contains("FLOOD_WAIT", ignoreCase = true) -> CategorizedError(
                code = "RATE_LIMIT_EXCEEDED",
                message = "Telegram API rate limit reached. Waiting required.",
                severity = ErrorSeverity.RETRYABLE,
                suggestedAction = "Engine will automatically back off and retry after wait duration."
            )
            msg.contains("NETWORK", ignoreCase = true) || msg.contains("TIMEOUT", ignoreCase = true) -> CategorizedError(
                code = "NETWORK_ERROR",
                message = "Connection timeout or internet lost.",
                severity = ErrorSeverity.RETRYABLE,
                suggestedAction = "Engine will auto-reconnect once internet is restored."
            )
            msg.contains("SESSION_REVOKED", ignoreCase = true) || msg.contains("AUTH_KEY_UNREGISTERED", ignoreCase = true) -> CategorizedError(
                code = "SESSION_EXPIRED",
                message = "Telegram session was revoked or expired.",
                severity = ErrorSeverity.USER_ACTION_REQUIRED,
                suggestedAction = "Please log in again with your phone number."
            )
            msg.contains("CHAT_WRITE_FORBIDDEN", ignoreCase = true) || msg.contains("CHANNEL_PRIVATE", ignoreCase = true) -> CategorizedError(
                code = "PERMISSION_DENIED",
                message = "You don't have posting permissions in destination channel/group.",
                severity = ErrorSeverity.PERMANENT,
                suggestedAction = "Check admin rights or channel membership."
            )
            msg.contains("MESSAGE_PROTECTED", ignoreCase = true) -> CategorizedError(
                code = "FORWARD_RESTRICTED",
                message = "The source channel restricts forwarding and saving content.",
                severity = ErrorSeverity.PERMANENT,
                suggestedAction = "Use 'Copy Content as New Message' mode instead of native forward."
            )
            else -> CategorizedError(
                code = code ?: "UNEXPECTED_ERROR",
                message = msg,
                severity = ErrorSeverity.RETRYABLE,
                suggestedAction = "Review logs or test rule in the editor."
            )
        }
    }
}
