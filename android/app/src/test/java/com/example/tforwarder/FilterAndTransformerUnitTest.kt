package com.example.tforwarder

import com.example.tforwarder.filters.KeywordFilter
import com.example.tforwarder.filters.RegexFilter
import com.example.tforwarder.transformations.ReplacementRule
import com.example.tforwarder.transformations.ReplacementType
import com.example.tforwarder.transformations.TextTransformer
import org.junit.Assert.*
import org.junit.Test

class FilterAndTransformerUnitTest {

    @Test
    fun testKeywordFilter_includeAndExclude() {
        val filter = KeywordFilter(
            includeKeywords = listOf("BUY", "SELL"),
            excludeKeywords = listOf("SCAM", "PROMO"),
            matchAll = false,
            caseSensitive = false
        )

        // Matches include BUY
        val res1 = filter.evaluate("GOLD BUY NOW Entry: 2650")
        assertTrue(res1.passed)

        // Excluded because of SCAM
        val res2 = filter.evaluate("BUY THIS TOKEN SCAM PROMO")
        assertFalse(res2.passed)
        assertTrue(res2.reason?.contains("SCAM") == true)

        // Filtered out because neither BUY nor SELL is present
        val res3 = filter.evaluate("Market analysis for the weekend")
        assertFalse(res3.passed)
    }

    @Test
    fun testRegexFilter_forexSignal() {
        val filter = RegexFilter("""\b(BUY|SELL)\s+[A-Z0-9]+\b""", "i")
        assertTrue(filter.isValidPattern)

        val passResult = filter.evaluate("URGENT: BUY XAUUSD at market price")
        assertTrue(passResult.passed)

        val failResult = filter.evaluate("Just a casual comment with no trades")
        assertFalse(failResult.passed)
    }

    @Test
    fun testTextTransformer_goldToXauusd() {
        val rules = listOf(
            ReplacementRule(
                id = "1",
                findText = "GOLD",
                replaceWith = "XAUUSD",
                type = ReplacementType.EXACT_WORD,
                isCaseSensitive = false
            )
        )

        val transformer = TextTransformer(
            replacements = rules,
            prefix = "🔥 PREMIUM SIGNAL",
            suffix = "⚡ Manage Risk Carefully",
            removeLinks = true,
            trimExtraLines = true,
            appendSourceTimestamp = false
        )

        val original = """
            GOLD BUY
            Entry: 2650
            SL: 2640
            TP: 2670
            Join us at https://t.me/spamchannel
        """.trimIndent()

        val output = transformer.transform(original)

        assertTrue(output.contains("XAUUSD BUY"))
        assertFalse(output.contains("GOLD BUY"))
        assertFalse(output.contains("https://t.me/spamchannel"))
        assertTrue(output.startsWith("🔥 PREMIUM SIGNAL"))
        assertTrue(output.endsWith("⚡ Manage Risk Carefully"))
    }
}
