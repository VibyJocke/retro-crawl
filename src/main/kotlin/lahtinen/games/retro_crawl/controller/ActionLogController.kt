package lahtinen.games.retro_crawl.controller

import javax.swing.JTextArea
import javax.swing.SwingUtilities
import javax.swing.text.DefaultCaret

class ActionLogController private constructor() {
    private lateinit var actionLogTextArea: JTextArea

    fun setActionLogTextArea(textArea: JTextArea) {
        actionLogTextArea = textArea
        val defaultCaret = actionLogTextArea.caret as DefaultCaret
        defaultCaret.updatePolicy = DefaultCaret.OUT_BOTTOM
    }

    fun log(text: String) {
        appendText("$text\n")
    }

    //TODO: scroll to bottom of actionlog
    private fun appendText(text: String) {
        SwingUtilities.invokeLater {
            actionLogTextArea.append(text)
            actionLogTextArea.caretPosition = actionLogTextArea.document.length
        }
    }

    companion object {
        val INSTANCE = ActionLogController()
    }
}
