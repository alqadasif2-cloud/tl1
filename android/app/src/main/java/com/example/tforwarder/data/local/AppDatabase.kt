package com.example.tforwarder.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.tforwarder.data.local.entities.ForwardingRuleEntity
import com.example.tforwarder.data.local.entities.MessageProcessingLogEntity
import com.example.tforwarder.data.local.entities.ProcessedMessageEntity

@Database(
    entities = [
        ForwardingRuleEntity::class,
        MessageProcessingLogEntity::class,
        ProcessedMessageEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun ruleDao(): RuleDao
    abstract fun messageLogDao(): MessageLogDao
    abstract fun processedMessageDao(): ProcessedMessageDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "tforwarder_database.db"
                )
                    .fallbackToDestructiveMigrationOnDowngrade()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
