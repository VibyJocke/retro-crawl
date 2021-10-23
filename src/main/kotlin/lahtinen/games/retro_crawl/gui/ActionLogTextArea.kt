package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.MonsterHit
import lahtinen.games.retro_crawl.events.PlayerDied
import lahtinen.games.retro_crawl.events.PlayerEscaped
import lahtinen.games.retro_crawl.events.PlayerHit
import lahtinen.games.retro_crawl.events.StoryExposition
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import javax.swing.JTextArea
import javax.swing.SwingUtilities

class ActionLogTextArea : JTextArea() {
    private val hitVariations = listOf("SMACK!", "SLASH!", "KAPOW!", "THUD!", "BAM!", "CLINK!")

    init {
        EventBus.getDefault().register(this)
        isEditable = false
        lineWrap = true
        wrapStyleWord = true
        columns = 30
        rows = 10
    }

    @Subscribe
    fun onLog(event: StoryExposition) = log(event.text)

    @Subscribe
    fun onLog(event: PlayerHit) {
        log(hitVariations.random())
        log("You got hit for ${event.damage} damage.")
    }

    @Subscribe
    fun onLog(event: MonsterHit) {
        log(hitVariations.random())
        log("You hit for ${event.damage} damage.")
    }

    @Subscribe
    fun onLog(event: MonsterEncountered) = log("A wild ${event.monster.name} appears!")

    @Subscribe
    fun onLog(event: PlayerEscaped) =
        if (event.successful) log("You escaped successfully!") else log("You failed to escape!")

    @Subscribe
    fun onLog(event: MonsterDied) = log("You killed the ${event.monster.name}!")

    @Subscribe
    fun onLog(event: PlayerDied) = log("You died...")

    private fun log(text: String) {
        SwingUtilities.invokeLater {
            insert("$text\n\n", 0)
        }
    }
}
