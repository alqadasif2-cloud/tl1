package com.example.tforwarder.forwarding

import com.example.tforwarder.data.local.entities.ForwardingRuleEntity

class RuleMatcher {
    fun matchRulesForSource(
        sourceChatId: String,
        rules: List<ForwardingRuleEntity>
    ): List<ForwardingRuleEntity> {
        return rules.filter { rule ->
            if (!rule.isEnabled) return@filter false
            val sources = rule.sourceChatIds.split(",").map { it.trim() }
            sources.contains(sourceChatId) || sources.contains("*")
        }
    }
}
