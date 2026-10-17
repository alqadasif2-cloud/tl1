package com.example.tforwarder.data.local

import androidx.room.*
import com.example.tforwarder.data.local.entities.MessageProcessingLogEntity
import com.example.tforwarder.data.local.entities.ProcessedMessageEntity
import com.example.tforwarder.data.local.entities.ProcessingStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageLogDao {
    @Query("SELECT * FROM message_processing_logs ORDER BY createdAt DESC LIMIT :limit OFFSET :offset")
    fun getRecentLogs(limit: Int = 100, offset: Int = 0): Flow<List<MessageProcessingLogEntity>>

    @Query("SELECT * FROM message_processing_logs WHERE ruleId = :ruleId ORDER BY createdAt DESC")
    fun getLogsByRule(ruleId: String): Flow<List<MessageProcessingLogEntity>>

    @Query("SELECT * FROM message_processing_logs WHERE processingStatus = :status ORDER BY createdAt DESC")
    fun getLogsByStatus(status: ProcessingStatus): Flow<List<MessageProcessingLogEntity>>

    @Query("SELECT * FROM message_processing_logs WHERE id = :id")
    suspend fun getLogById(id: String): MessageProcessingLogEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: MessageProcessingLogEntity)

    @Query("DELETE FROM message_processing_logs WHERE createdAt < :beforeTimestamp")
    suspend fun deleteLogsOlderThan(beforeTimestamp: Long): Int

    @Query("DELETE FROM message_processing_logs")
    suspend fun clearAllLogs()

    @Query("SELECT COUNT(*) FROM message_processing_logs")
    fun getTotalLogsCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM message_processing_logs WHERE processingStatus = 'SUCCESS'")
    fun getSuccessLogsCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM message_processing_logs WHERE processingStatus = 'FAILED'")
    fun getFailedLogsCount(): Flow<Int>

    @Query("SELECT createdAt FROM message_processing_logs ORDER BY createdAt DESC LIMIT 1")
    fun getLastProcessedTime(): Flow<Long?>

    @Query("SELECT completedAt FROM message_processing_logs WHERE processingStatus = 'SUCCESS' ORDER BY completedAt DESC LIMIT 1")
    fun getLastSuccessfulTime(): Flow<Long?>
}

@Dao
interface ProcessedMessageDao {
    @Query("SELECT * FROM processed_messages WHERE sourceChatId = :sourceChatId AND sourceMessageId = :sourceMessageId AND destinationChatId = :destinationChatId AND ruleId = :ruleId")
    suspend fun findProcessed(
        sourceChatId: String,
        sourceMessageId: Long,
        destinationChatId: String,
        ruleId: String
    ): ProcessedMessageEntity?

    @Query("SELECT * FROM processed_messages WHERE messageHash = :hash AND destinationChatId = :destinationChatId AND lastAttemptAt > :sinceTimestamp")
    suspend fun findByHash(
        hash: String,
        destinationChatId: String,
        sinceTimestamp: Long
    ): ProcessedMessageEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun markProcessed(processedMessage: ProcessedMessageEntity)

    @Query("DELETE FROM processed_messages WHERE lastAttemptAt < :beforeTimestamp")
    suspend fun purgeOldProcessedRecords(beforeTimestamp: Long): Int
}
