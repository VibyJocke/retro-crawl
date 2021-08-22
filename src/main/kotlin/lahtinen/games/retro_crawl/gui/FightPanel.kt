package lahtinen.games.retro_crawl.gui

import java.awt.BorderLayout
import java.awt.event.ActionEvent
import javax.swing.AbstractAction
import javax.swing.JButton
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.border.EmptyBorder

class FightPanel : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Fight!")
        title.font = GuiConstants.FONT
        add(title, BorderLayout.NORTH)
        add(getButtons(), BorderLayout.SOUTH)
        isVisible = true
    }

    private fun getButtons(): JPanel {
        val panel = JPanel(BorderLayout())
        val fightButton = JButton(object : AbstractAction("Done!") {
            override fun actionPerformed(e: ActionEvent) {
                // TODO
            }
        })
        val fleeButton = JButton(object : AbstractAction("Done!") {
            override fun actionPerformed(e: ActionEvent) {
                // TODO
            }
        })
        panel.add(fightButton, BorderLayout.EAST)
        panel.add(fleeButton, BorderLayout.WEST)
        return panel
    }
}
