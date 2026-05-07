package com.policyfundpedia.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF1A56DB),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDDE7FF),
    onPrimaryContainer = Color(0xFF0B2E77),
    secondaryContainer = Color(0xFFEAF1FF),
    onSecondaryContainer = Color(0xFF17345E),
    background = Color(0xFFF8F7F5),
    onBackground = Color(0xFF111827),
    surface = Color.White,
    onSurface = Color(0xFF111827),
    onSurfaceVariant = Color(0xFF64748B)
)

@Composable
fun PolicyFundTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content
    )
}
