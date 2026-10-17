package com.example.tforwarder.forwarding

import com.example.tforwarder.core.AppResult
import com.example.tforwarder.core.ErrorHandler
import com.example.tforwarder.data.local.MessageLogDao
import com.example.tforwarder.data.local.RuleDao
import com.example.tforwarder.data.local.entities.ForwardingMode
import com.example.tforwarder.data.local.entities.ForwardingRuleEntity
import com.example.tforwarder.data.local.entities.MessageProcessingLogEntity
import com.example.tforwarder.data.local.entities.ProcessingStatus
import com.example.tforwarder.filters.KeywordFilter
import com.example.tforwarder.filters.MessageTypeFilter
import com.example.tforwarder.filters.RegexFilter
import com.example.tforwarder.filters.TelegramMessageType
import com.example.tforwarder.telegram.TelegramMessageForwarder
import com.example.tforwarder.transformations.ReplacementRule
import com.example.tforwarder.transformations.TextTransformer
import java.util.UUID

data class IncomingMessage(
    val messageId: Long,
    val sourceChatId: String,
    val sourceChatName: String,
    val text: String,
    val messageType: TelegramMessageType,
    val hasLinks: Boolean = false,
    val mediaFileId: String? = null,
    val isAlbum: Boolean = false,
    val date: Long = System.currentTimeMillis()
)

class MessageProcessor(
    private val ruleDao: RuleDao,
    private val messageLogDao: MessageLogDao,
    private val duplicateDetector: DuplicateDetector,
    private val messageForwarder: TelegramMessageForwarder
) {

    suspend fun processIncomingMessage(
        message: IncomingMessage,
        rule: ForwardingRuleEntity
    ) {
        val destChatIds = rule.destinationChatIds.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val destNames = rule.destinationChatNames.split(",").map { it.trim() }

        for (index in destChatIds.indices) {
            val destId = destChatIds[index]
            val destName = if (index < destNames.size) destNames[index] else destId
            processForDestination(message, rule, destId, destName)
        }
    }

    private suspend fun processForDestination(
        message: IncomingMessage,
        rule: ForwardingRuleEntity,
        destId: String,
        destName: String
    ) {
        val logId = UUID.randomUUID().toString()

        // 1. Check for duplicates
        val isDuplicate = duplicateDetector.isDuplicate(
            sourceChatId = message.sourceChatId,
            sourceMessageId = message.messageId,
            destinationChatId = destId,
            ruleId = rule.id,
            contentBody = message.text
        )

        if (isDuplicate) {
            val log = MessageProcessingLogEntity(
                id = logId,
                ruleId = rule.id,
                ruleName = rule.name,
                sourceChatId = message.sourceChatId,
                sourceChatName = message.sourceChatName,
                sourceMessageId = message.messageId,
                destinationChatId = destId,
                destinationChatName = destName,
                messageType = message.messageType.name,
                originalPreview = message.text.take(200),
                processingStatus = ProcessingStatus.DUPLICATE_SKIPPED,
                filterReason = "Already processed for this destination (duplicate skipped)"
            )
            messageLogDao.insertLog(log)
            return
        }

        // 2. Check message type & link filters
        val typeFilter = MessageTypeFilter(
            allowTextOnly = rule.allowTextOnly,
            allowPhotos = rule.allowPhotos,
            allowVideos = rule.allowVideos,
            allowDocuments = rule.allowDocuments,
            allowAudio = rule.allowAudio,
            allowVoice = rule.allowVoice,
            allowLinks = rule.allowLinks,
            allowAlbums = rule.allowAlbums
        )

        val typeResult = typeFilter.evaluate(message.messageType, message.hasLinks)
        if (!typeResult.passed) {
            val log = MessageProcessingLogEntity(
                id = logId,
                ruleId = rule.id,
                ruleName = rule.name,
                sourceChatId = message.sourceChatId,
                sourceChatName = message.sourceChatName,
                sourceMessageId = message.messageId,
                destinationChatId = destId,
                destinationChatName = destName,
                messageType = message.messageType.name,
                originalPreview = message.text.take(200),
                processingStatus = ProcessingStatus.FILTERED_OUT,
                filterReason = typeResult.reason
            )
            messageLogDao.insertLog(log)
            ruleDao.incrementStats(rule.id, forwardedCount = 0, failedCount = 0, lastSuccess = null)
            return
        }

        // 3. Check Keyword Filters
        val incKeywords = rule.includeKeywords.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val excKeywords = rule.excludeKeywords.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val keywordFilter = KeywordFilter(
            includeKeywords = incKeywords,
            excludeKeywords = excKeywords,
            matchAll = rule.matchAllKeywords,
            caseSensitive = rule.caseSensitiveKeywords
        )

        val keywordResult = keywordFilter.evaluate(message.text)
        if (!keywordResult.passed) {
            val log = MessageProcessingLogEntity(
                id = logId,
                ruleId = rule.id,
                ruleName = rule.name,
                sourceChatId = message.sourceChatId,
                sourceChatName = message.sourceChatName,
                sourceMessageId = message.messageId,
                destinationChatId = destId,
                destinationChatName = destName,
                messageType = message.messageType.name,
                originalPreview = message.text.take(200),
                processingStatus = ProcessingStatus.FILTERED_OUT,
                filterReason = keywordResult.reason
            )
            messageLogDao.insertLog(log)
            ruleDao.incrementStats(rule.id, forwardedCount = 0, failedCount = 0, lastSuccess = null)
            return
        }

        // 4. Check Regex Filter
        if (rule.regexPattern.isNotBlank()) {
            val regexFilter = RegexFilter(rule.regexPattern, rule.regexFlags)
            val regexResult = regexFilter.evaluate(message.text)
            if (!regexResult.passed) {
                val log = MessageProcessingLogEntity(
                    id = logId,
                    ruleId = rule.id,
                    ruleName = rule.name,
                    sourceChatId = message.sourceChatId,
                    sourceChatName = message.sourceChatName,
                    sourceMessageId = message.messageId,
                    destinationChatId = destId,
                    destinationChatName = destName,
                    messageType = message.messageType.name,
                    originalPreview = message.text.take(200),
                    processingStatus = ProcessingStatus.FILTERED_OUT,
                    filterReason = regexResult.reason
                )
                messageLogDao.insertLog(log)
                ruleDao.incrementStats(rule.id, forwardedCount = 0, failedCount = 0, lastSuccess = null)
                return
            }
        }

        // 5. Apply Text Transformations
        val transformer = TextTransformer(
            replacements = parseReplacements(rule.transformationsJson),
            prefix = rule.prefixText,
            suffix = rule.suffixText,
            removeLinks = rule.removeLinks,
            trimExtraLines = rule.trimExtraLines,
            removeCustomSignatures = rule.removeCustomSignatures.split(",").map { it.trim() },
            appendSourceTimestamp = rule.appendSourceTimestamp,
            sourceChannelTitle = message.sourceChatName
        )
        val transformedText = transformer.transform(message.text)

        // 6. Forward or Send content via Telegram API
        val sendResult = when (rule.forwardingMode) {
            ForwardingMode.NATIVE_FORWARD -> {
                messageForwarder.forwardMessage(
                    sourceChatId = message.sourceChatId,
                    sourceMessageId = message.messageId,
                    destinationChatId = destId
                )
            }
            ForwardingMode.COPY_CONTENT, ForwardingMode.COPY_WITHOUT_AUTHOR -> {
                messageForwarder.sendNewMessage(
                    destinationChatId = destId,
                    text = transformedText,
                    mediaFileId = message.mediaFileId,
                    mediaType = message.messageType
                )
            }
        }

        // 7. Record result & Update metrics
        when (sendResult) {
            is AppResult.Success -> {
                val log = MessageProcessingLogEntity(
                    id = logId,
                    ruleId = rule.id,
                    ruleName = rule.name,
                    sourceChatId = message.sourceChatId,
                    sourceChatName = message.sourceChatName,
                    sourceMessageId = message.messageId,
                    destinationChatId = destId,
                    destinationChatName = destName,
                    destinationMessageId = sendResult.data,
                    messageType = message.messageType.name,
                    originalPreview = message.text.take(200),
                    transformedPreview = transformedText.take(200),
                    processingStatus = ProcessingStatus.SUCCESS,
                    completedAt = System.currentTimeMillis()
                )
                messageLogDao.insertLog(log)
                duplicateDetector.recordProcessed(
                    sourceChatId = message.sourceChatId,
                    sourceMessageId = message.messageId,
                    destinationChatId = destId,
                    ruleId = rule.id,
                    contentBody = message.text,
                    status = ProcessingStatus.SUCCESS
                )
                ruleDao.incrementStats(rule.id, forwardedCount = 1, failedCount = 0, lastSuccess = System.currentTimeMillis())
            }
            is AppResult.Error -> {
                val categorized = ErrorHandler.categorize(
                    sendResult.cause ?: Exception(sendResult.message),
                    sendResult.code
                )
                val log = MessageProcessingLogEntity(
                    id = logId,
                    ruleId = rule.id,
                    ruleName = rule.name,
                    sourceChatId = message.sourceChatId,
                    sourceChatName = message.sourceChatName,
                    sourceMessageId = message.messageId,
                    destinationChatId = destId,
                    destinationChatName = destName,
                    messageType = message.messageType.name,
                    originalPreview = message.text.take(200),
                    transformedPreview = transformedText.take(200),
                    processingStatus = ProcessingStatus.FAILED,
                    errorCode = categorized.code,
                    errorMessage = "${categorized.message} - ${categorized.suggestedAction}",
                    errorStackTrace = sendResult.cause?.stackTraceToString()
                )
                messageLogDao.insertLog(log)
                ruleDao.incrementStats(rule.id, forwardedCount = 0, failedCount = 1, lastSuccess = null)
            }
            AppResult.Loading -> Unit
        }
    }

    private fun parseReplacements(json: String): List<ReplacementRule> {
        // Minimal JSON parser helper or Kotlin serialization
        return try {
            val list = mutableListOf<ReplacementRule>()
            val regex = Regex("""\{"findText":"(.*?)","replaceWith":"(.*?)","type":"(.*?)","caseSensitive":(true|false)\}""")
            for (match in regex.findAll(json)) {
                val (find, replace, typeStr, caseSens) = match.destructured
                list.add(
                    ReplacementRule(
                        id = UUID.randomUUID().toString(),
                        findText = find,
                        replaceWith = replace,
                        type = try { com.example.tforwarder.transformations.ReplacementType.valueOf(typeStr) } catch(e: Exception) { com.example.tforwarder.transformations.ReplacementType.EXACT_WORD },
                        isCaseSensitive = caseSens.toBoolean()
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }
}
