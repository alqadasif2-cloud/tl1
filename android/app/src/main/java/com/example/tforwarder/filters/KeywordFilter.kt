package com.example.tforwarder.filters

data class FilterEvaluationResult(
    val passed: Boolean,
    val reason: String? = null
)

class KeywordFilter(
    private val includeKeywords: List<String>,
    private val excludeKeywords: List<String>,
    private val matchAll: Boolean = false,
    private val caseSensitive: Boolean = false
) {
    fun evaluate(text: String): FilterEvaluationResult {
        val normalizedText = if (caseSensitive) text else text.lowercase()

        // 1. Exclude keywords check
        if (excludeKeywords.isNotEmpty()) {
            for (keyword in excludeKeywords) {
                val cleaned = keyword.trim()
                if (cleaned.isEmpty()) continue
                val target = if (caseSensitive) cleaned else cleaned.lowercase()
                if (normalizedText.contains(target)) {
                    return FilterEvaluationResult(
                        passed = false,
                        reason = "Excluded by keyword: '$cleaned'"
                    )
                }
            }
        }

        // 2. Include keywords check
        val activeIncludes = includeKeywords.map { it.trim() }.filter { it.isNotEmpty() }
        if (activeIncludes.isEmpty()) {
            return FilterEvaluationResult(passed = true)
        }

        return if (matchAll) {
            val allPresent = activeIncludes.all { keyword ->
                val target = if (caseSensitive) keyword else keyword.lowercase()
                normalizedText.contains(target)
            }
            if (allPresent) {
                FilterEvaluationResult(passed = true)
            } else {
                FilterEvaluationResult(
                    passed = false,
                    reason = "Missing some required keywords (Match All enabled)"
                )
            }
        } else {
            val anyPresent = activeIncludes.any { keyword ->
                val target = if (caseSensitive) keyword else keyword.lowercase()
                normalizedText.contains(target)
            }
            if (anyPresent) {
                FilterEvaluationResult(passed = true)
            } else {
                FilterEvaluationResult(
                    passed = false,
                    reason = "None of the required keywords found in message"
                )
            }
        }
    }
}

class RegexFilter(
    private val patternString: String,
    private val flagsString: String = "i"
) {
    private val compiledRegex: Regex? = try {
        if (patternString.isNotBlank()) {
            val options = mutableSetOf<RegexOption>()
            if (flagsString.contains("i")) options.add(RegexOption.IGNORE_CASE)
            if (flagsString.contains("m")) options.add(RegexOption.MULTILINE)
            if (flagsString.contains("s")) options.add(RegexOption.DOT_MATCHES_ALL)
            Regex(patternString, options)
        } else null
    } catch (e: Exception) {
        null
    }

    val isValidPattern: Boolean get() = patternString.isBlank() || compiledRegex != null

    fun evaluate(text: String): FilterEvaluationResult {
        if (patternString.isBlank()) return FilterEvaluationResult(passed = true)
        val regex = compiledRegex ?: return FilterEvaluationResult(
            passed = false,
            reason = "Invalid regular expression pattern"
        )

        return if (regex.containsMatchIn(text)) {
            FilterEvaluationResult(passed = true)
        } else {
            FilterEvaluationResult(
                passed = false,
                reason = "Pattern '$patternString' did not match text"
            )
        }
    }

    companion object {
        fun validate(pattern: String): Pair<Boolean, String?> {
            return try {
                Regex(pattern)
                Pair(true, null)
            } catch (e: Exception) {
                Pair(false, e.message)
            }
        }
    }
}
