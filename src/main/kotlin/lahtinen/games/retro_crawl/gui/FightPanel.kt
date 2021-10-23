package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.monster.Monster
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import java.awt.BorderLayout
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTextArea
import javax.swing.border.EmptyBorder

class FightPanel : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        isVisible = true
        EventBus.getDefault().register(this)
    }

    @Subscribe
    fun onMonsterEncountered(event: MonsterEncountered) {
        val title = JLabel("Fight!")
        title.font = GuiConstants.TITLE_FONT
        add(title, BorderLayout.NORTH)
        add(MonsterImage(event.monster), BorderLayout.CENTER)
        add(JTextArea(event.monster.monsterName), BorderLayout.SOUTH) // TODO replace with structured panel
        repaint()
    }
}
