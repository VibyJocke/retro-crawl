package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.events.MonsterEncountered
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import java.awt.BorderLayout
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTable
import javax.swing.border.EmptyBorder

class FightPanel : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        isVisible = true
        EventBus.getDefault().register(this)
    }

    @Subscribe
    fun onMonsterEncountered(event: MonsterEncountered) {
        add(JLabel("Fight!").apply { font = GuiConstants.TITLE_FONT }, BorderLayout.NORTH)
        add(MonsterImage(event.monster), BorderLayout.CENTER)
        add(
            JTable(
                arrayOf(
                    arrayOf("Monster", event.monster.monsterName),
                    arrayOf("Health", event.monster.baseHealth),
                    arrayOf("Damage", event.monster.baseDamage)
                ),
                arrayOf("Field", "Value")
            ), BorderLayout.SOUTH
        )
        repaint()
    }
}
