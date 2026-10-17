package com.example.tforwarder.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureStorage(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs: SharedPreferences = try {
        EncryptedSharedPreferences.create(
            context,
            "tforwarder_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        // Fallback with recreation if key was invalidated
        context.getSharedPreferences("tforwarder_secure_prefs", Context.MODE_PRIVATE).edit().clear().apply()
        EncryptedSharedPreferences.create(
            context,
            "tforwarder_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var apiId: Int
        get() = securePrefs.getInt(KEY_API_ID, 0)
        set(value) = securePrefs.edit().putInt(KEY_API_ID, value).apply()

    var apiHash: String?
        get() = securePrefs.getString(KEY_API_HASH, null)
        set(value) = securePrefs.edit().putString(KEY_API_HASH, value).apply()

    var sessionToken: String?
        get() = securePrefs.getString(KEY_SESSION_TOKEN, null)
        set(value) = securePrefs.edit().putString(KEY_SESSION_TOKEN, value).apply()

    var userPhone: String?
        get() = securePrefs.getString(KEY_USER_PHONE, null)
        set(value) = securePrefs.edit().putString(KEY_USER_PHONE, value).apply()

    var userFullName: String?
        get() = securePrefs.getString(KEY_USER_NAME, null)
        set(value) = securePrefs.edit().putString(KEY_USER_NAME, value).apply()

    var userUsername: String?
        get() = securePrefs.getString(KEY_USER_USERNAME, null)
        set(value) = securePrefs.edit().putString(KEY_USER_USERNAME, value).apply()

    var isServiceEnabled: Boolean
        get() = securePrefs.getBoolean(KEY_SERVICE_ENABLED, false)
        set(value) = securePrefs.edit().putBoolean(KEY_SERVICE_ENABLED, value).apply()

    fun clearSession() {
        securePrefs.edit()
            .remove(KEY_SESSION_TOKEN)
            .remove(KEY_USER_PHONE)
            .remove(KEY_USER_NAME)
            .remove(KEY_USER_USERNAME)
            .apply()
    }

    companion object {
        private const val KEY_API_ID = "tg_api_id"
        private const val KEY_API_HASH = "tg_api_hash"
        private const val KEY_SESSION_TOKEN = "tg_session_token"
        private const val KEY_USER_PHONE = "tg_user_phone"
        private const val KEY_USER_NAME = "tg_user_name"
        private const val KEY_USER_USERNAME = "tg_user_username"
        private const val KEY_SERVICE_ENABLED = "service_enabled"
    }
}
