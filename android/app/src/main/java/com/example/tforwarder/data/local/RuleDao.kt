package com.example.tforwarder.data.local

import androidx.room.*
import com.example.tforwarder.data.local.entities.ForwardingRuleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RuleDao {
    @Query("SELECT * FROM forwarding_rules ORDER BY createdAt DESC")
    fun getAllRules(): Flow<List<ForwardingRuleEntity>>

    @Query("SELECT * FROM forwarding_rules WHERE isEnabled = 1")
    fun getActiveRules(): Flow<List<ForwardingRuleEntity>>

    @Query("SELECT * FROM forwarding_rules WHERE isEnabled = 1")
    suspend fun getActiveRulesSync(): List<ForwardingRuleEntity>

    @Query("SELECT * FROM forwarding_rules WHERE id = :id")
    suspend fun getRuleById(id: String): ForwardingRuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(rule: ForwardingRuleEntity)

    @Delete
    suspend fun delete(rule: ForwardingRuleEntity)

    @Query("UPDATE forwarding_rules SET isEnabled = :isEnabled, updatedAt = :updatedAt WHERE id = :id")
    suspend fun setRuleEnabled(id: String, isEnabled: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE forwarding_rules SET totalProcessedCount = totalProcessedCount + 1, totalForwardedCount = totalForwardedCount + :forwardedCount, totalFailedCount = totalFailedCount + :failedCount, lastSuccessfulExecution = :lastSuccess WHERE id = :ruleId")
    suspend fun incrementStats(ruleId: String, forwardedCount: Int, failedCount: Int, lastSuccess: Long?)

    @Query("SELECT COUNT(*) FROM forwarding_rules")
    fun getTotalCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM forwarding_rules WHERE isEnabled = 1")
    fun getActiveCount(): Flow<Int>
}
