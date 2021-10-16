package lahtinen.games.retro_crawl.controller

import javax.swing.JTextArea
import javax.swing.SwingUtilities

class ActionLogController private constructor() {
    private lateinit var actionLogTextArea: JTextArea

    fun setActionLogTextArea(textArea: JTextArea) {
        actionLogTextArea = textArea
    }

    fun log(text: String) {
        SwingUtilities.invokeLater {
            actionLogTextArea.insert("$text\n\n", 0)
        }
    }

    companion object {
        val INSTANCE = ActionLogController()
    }
}
