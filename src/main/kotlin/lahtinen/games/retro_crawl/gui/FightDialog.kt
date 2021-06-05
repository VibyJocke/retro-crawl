package lahtinen.games.retro_crawl.gui

import java.awt.BorderLayout
import java.awt.Font
import java.awt.event.ActionEvent
import javax.swing.*
import javax.swing.border.EmptyBorder


class FightDialog(owner: JFrame?) : JDialog(owner, true) {

    init {
        setSize(300, 225)
        isResizable = false
        setLocationRelativeTo(owner)
        title = "You are fighting!"
        layout = BorderLayout()
        val mainPanel = JPanel(BorderLayout())
        mainPanel.border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Character creation")
        title.font = Font("verdana", Font.BOLD, 16)
        mainPanel.add(title, BorderLayout.NORTH)
        mainPanel.add(getButtons(), BorderLayout.SOUTH)
        contentPane.add(mainPanel)
        isVisible = true
    }

    private fun getButtons(): JPanel {
        val panel = JPanel(BorderLayout())
        val fightButton = JButton(object : AbstractAction("Done!") {
            override fun actionPerformed(e: ActionEvent) {
                dispose()
            }
        })
        val fleeButton = JButton(object : AbstractAction("Done!") {
            override fun actionPerformed(e: ActionEvent) {
                dispose()
            }
        })
        panel.add(fightButton, BorderLayout.EAST)
        panel.add(fleeButton, BorderLayout.WEST)
        return panel
    }
}
