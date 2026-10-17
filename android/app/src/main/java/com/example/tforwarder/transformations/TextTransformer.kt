package com.example.tforwarder.transformations

enum class ReplacementType {
    EXACT_WORD,
    PHRASE,
    REGEX,
    DELETE_MATCH
}

data class ReplacementRule(
    val id: String,
    val findText: String,
    val replaceWith: String = "",
    val type: ReplacementType = ReplacementType.EXACT_WORD,
    val isCaseSensitive: Boolean = false,
    val isEnabled: Boolean = true
)

class TextTransformer(
    private val replacements: List<ReplacementRule> = emptyList(),
    private val prefix: String = "",
    private val suffix: String = "",
    private val removeLinks: Boolean = false,
    private val trimExtraLines: Boolean = true,
    private val removeCustomSignatures: List<String> = emptyList(),
    private val appendSourceTimestamp: Boolean = false,
    private val sourceChannelTitle: String? = null
) {
    fun transform(originalText: String): String {
        var result = originalText

        // 1. Remove custom signatures if present
        for (sig in removeCustomSignatures) {
            val cleanedSig = sig.trim()
            if (cleanedSig.isNotEmpty()) {
                result = result.replace(cleanedSig, "")
            }
        }

        // 2. Remove URLs/Links if requested
        if (removeLinks) {
            val urlRegex = Regex("""(https?://[^\s]+|t\.me/[^\s]+|@[a-zA-Z0-9_]{4,})""", RegexOption.IGNORE_CASE)
            result = urlRegex.replace(result, "")
        }

        // 3. Apply custom replacements pipeline in sequential order
        for (rule in replacements) {
            if (!rule.isEnabled || rule.findText.isEmpty()) continue

            result = when (rule.type) {
                ReplacementType.EXACT_WORD -> {
                    val boundaryPattern = Regex("""\b${Regex.escape(rule.findText)}\b""",
                        if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE)
                    )
                    boundaryPattern.replace(result, rule.replaceWith)
                }
                ReplacementType.PHRASE -> {
                    if (rule.isCaseSensitive) {
                        result.replace(rule.findText, rule.replaceWith)
                    } else {
                        val pattern = Regex(Regex.escape(rule.findText), RegexOption.IGNORE_CASE)
                        pattern.replace(result, rule.replaceWith)
                    }
                }
                ReplacementType.REGEX -> {
                    try {
                        val pattern = Regex(rule.findText,
                            if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE)
                        )
                        pattern.replace(result, rule.replaceWith)
                    } catch (e: Exception) {
                        result // Skip bad regex
                    }
                }
                ReplacementType.DELETE_MATCH -> {
                    val pattern = Regex(Regex.escape(rule.findText),
                        if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE)
                    )
                    pattern.replace(result, "")
                }
            }
        }

        // 4. Clean extra blank lines
        if (trimExtraLines) {
            result = result.replace(Regex("""\n{3,}"""), "\n\n").trim()
        }

        // 5. Apply Prefix
        if (prefix.isNotBlank()) {
            result = "${prefix.trim()}\n\n$result"
        }

        // 6. Apply Suffix
        if (suffix.isNotBlank()) {
            result = "$result\n\n${suffix.trim()}"
        }

        // 7. Append Source & Timestamp if requested
        if (appendSourceTimestamp) {
            val timeString = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.getDefault())
                .format(java.util.Date())
            val sourceTag = if (!sourceChannelTitle.isNullOrBlank()) "📢 $sourceChannelTitle | " else ""
            result = "$result\n\n— $sourceTag⏰ $timeString"
        }

        return result.trim()
    }
}
