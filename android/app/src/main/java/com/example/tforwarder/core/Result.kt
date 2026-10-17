package com.example.tforwarder.core

sealed class AppResult<out T> {
    data class Success<out T>(val data: T) : AppResult<T>()
    data class Error(
        val message: String,
        val code: String? = null,
        val cause: Throwable? = null,
        val isRetryable: Boolean = false
    ) : AppResult<Nothing>()
    object Loading : AppResult<Nothing>()

    val isSuccess: Boolean get() = this is Success
    val isError: Boolean get() = this is Error

    fun getOrNull(): T? = (this as? Success)?.data
}
