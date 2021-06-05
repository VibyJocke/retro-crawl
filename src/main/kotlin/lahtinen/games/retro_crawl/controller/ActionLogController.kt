package lahtinen.games.retro_crawl.controller

import javax.swing.JTextArea
import javax.swing.SwingUtilities

class ActionLogController private constructor() {
    private var actionLogTextArea: JTextArea? = null

    fun setActionLogTextArea(textArea: JTextArea?) {
        actionLogTextArea = textArea
    }

    fun log(text: String) {
        appendText("$text\n")
    }

    //TODO: scroll to bottom of actionlog
    private fun appendText(text: String) {
        if (actionLogTextArea != null) {
            SwingUtilities.invokeLater { actionLogTextArea!!.append(text) }
        }
    }

    companion object {
        val INSTANCE = ActionLogController()
    }
}
