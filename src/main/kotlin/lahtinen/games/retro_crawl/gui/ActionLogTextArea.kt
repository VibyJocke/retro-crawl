package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.controller.ActionLogController
import javax.swing.JTextArea

class ActionLogTextArea : JTextArea() {
    init {
        isEditable = false
        lineWrap = true
        wrapStyleWord = true
        columns = 30
        rows = 10
        ActionLogController.INSTANCE.setActionLogTextArea(this)
    }
}
