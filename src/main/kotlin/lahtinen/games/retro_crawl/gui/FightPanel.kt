package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.monster.Monster
import java.awt.BorderLayout
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTextArea
import javax.swing.border.EmptyBorder

class FightPanel(monster: Monster) : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Fight!")
        title.font = GuiConstants.TITLE_FONT
        add(title, BorderLayout.NORTH)
        add(MonsterImage(monster), BorderLayout.CENTER)
        add(JTextArea(monster.monsterName), BorderLayout.SOUTH) // TODO replace with structured panel
        isVisible = true
    }
}
