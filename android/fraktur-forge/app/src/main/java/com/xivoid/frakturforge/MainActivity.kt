package com.xivoid.frakturforge

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import java.text.Normalizer

/**
 * Single-screen Fraktur converter. No dependencies beyond the framework and the
 * Kotlin stdlib: conversion is a plain table lookup over the input's code points,
 * run live on each keystroke. Nothing leaves the device.
 */
class MainActivity : Activity() {

    private lateinit var input: EditText
    private lateinit var output: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        input = findViewById(R.id.input)
        output = findViewById(R.id.output)

        input.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun onTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun afterTextChanged(s: Editable?) {
                output.text = toFraktur(s?.toString() ?: "")
            }
        })

        findViewById<Button>(R.id.copy).setOnClickListener { copyOutput() }

        findViewById<Button>(R.id.clear).setOnClickListener {
            input.setText("")
            output.text = ""
            input.requestFocus()
        }

        findViewById<Button>(R.id.example).setOnClickListener {
            input.setText(getString(R.string.example_text))
            input.setSelection(input.text.length)
        }
    }

    private fun copyOutput() {
        val text = output.text?.toString().orEmpty()
        if (text.isEmpty()) {
            toast(R.string.nothing_to_copy)
            return
        }
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("fraktur", text))
        toast(R.string.copied)
    }

    private fun toast(resId: Int) = Toast.makeText(this, resId, Toast.LENGTH_SHORT).show()

    /**
     * Map each character to its bold-Fraktur form. Input is normalized to NFC so
     * decomposed umlauts (base letter + combining diaeresis) match the table.
     * Unmapped characters — digits, punctuation, spaces — pass through unchanged.
     */
    private fun toFraktur(text: String): String {
        val nfc = Normalizer.normalize(text, Normalizer.Form.NFC)
        val sb = StringBuilder(nfc.length)
        for (ch in nfc) sb.append(MAP[ch] ?: ch.toString())
        return sb.toString()
    }

    private companion object {
        // Combining diaeresis used to build the umlauts (no precomposed Fraktur
        // umlauts exist in Unicode).
        private const val D = "̈"

        val MAP: Map<Char, String> = mapOf(
            'A' to "𝕬", 'B' to "𝕭", 'C' to "𝕮",
            'D' to "𝕯", 'E' to "𝕰", 'F' to "𝕱",
            'G' to "𝕲", 'H' to "𝕳", 'I' to "𝕴",
            'J' to "𝕵", 'K' to "𝕶", 'L' to "𝕷",
            'M' to "𝕸", 'N' to "𝕹", 'O' to "𝕺",
            'P' to "𝕻", 'Q' to "𝕼", 'R' to "𝕽",
            'S' to "𝕾", 'T' to "𝕿", 'U' to "𝖀",
            'V' to "𝖁", 'W' to "𝖂", 'X' to "𝖃",
            'Y' to "𝖄", 'Z' to "𝖅",
            'a' to "𝖆", 'b' to "𝖇", 'c' to "𝖈",
            'd' to "𝖉", 'e' to "𝖊", 'f' to "𝖋",
            'g' to "𝖌", 'h' to "𝖍", 'i' to "𝖎",
            'j' to "𝖏", 'k' to "𝖐", 'l' to "𝖑",
            'm' to "𝖒", 'n' to "𝖓", 'o' to "𝖔",
            'p' to "𝖕", 'q' to "𝖖", 'r' to "𝖗",
            's' to "𝖘", 't' to "𝖙", 'u' to "𝖚",
            'v' to "𝖛", 'w' to "𝖜", 'x' to "𝖝",
            'y' to "𝖞", 'z' to "𝖟",

            // German umlauts: Fraktur base + combining diaeresis.
            'Ä' to "𝕬$D", 'Ö' to "𝕺$D", 'Ü' to "𝖀$D",
            'ä' to "𝖆$D", 'ö' to "𝖔$D", 'ü' to "𝖚$D",

            // Eszett has no Fraktur code point; render as a double-s ligature spelling.
            'ß' to "𝖘𝖘", 'ẞ' to "𝕾𝕾"
        )
    }
}
