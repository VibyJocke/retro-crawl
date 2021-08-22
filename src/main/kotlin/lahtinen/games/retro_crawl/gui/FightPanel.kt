package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.monster.Monster
import java.awt.BorderLayout
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.border.EmptyBorder

class FightPanel(monster: Monster) : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Fight!")
        title.font = GuiConstants.FONT
        add(title, BorderLayout.NORTH)
        add(MonsterImage(monster), BorderLayout.SOUTH)
        isVisible = true
    }
}
